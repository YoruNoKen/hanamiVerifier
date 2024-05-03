package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"hanami-verifier/utils"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func Callback(w http.ResponseWriter, r *http.Request) {

	code := r.URL.Query().Get("code")
	discordId, err := utils.GetIdFromState(r.URL.Query().Get("state"))
	if err != nil || discordId == "" {
		fmt.Println("Error getting discord ID from state:", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
		return
	}

	tokenStruct, err := utils.OauthConfig.Exchange(r.Context(), code)
	if err != nil {
		fmt.Println("Error exchanging code:", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
		return
	}

	accessToken := tokenStruct.AccessToken

	headers := map[string]string{
		"Content-Type":  "application/json",
		"Accept":        "Accept: application/json",
		"Authorization": "Bearer " + accessToken,
	}

	bytes, err := utils.Get("https://osu.ppy.sh/api/v2/me", headers)
	if err != nil {
		fmt.Println("Error making request to https://osu.ppy.sh/api/v2/me: ", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
		return
	}

	var data map[string]interface{}
	if err := json.Unmarshal(bytes, &data); err != nil {
		fmt.Println("Error parsing Json:", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
		return
	}

	db, err := sql.Open("sqlite3", "/root/HanamiBot/src/data.db")
	if err != nil {
		fmt.Println("Error while opening the database:", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
		return
	}

	defer db.Close()

	var rowExists bool
	err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)`, discordId).Scan(&rowExists)
	if err != nil {
		fmt.Println("Error while selecting existing row:", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
		return
	}

	fmt.Println(rowExists)
	fmt.Println(discordId)

	if rowExists {
		if _, err := db.Exec("UPDATE users SET banchoId = ? WHERE id = ?", data["id"], discordId); err != nil {
			fmt.Println("Error while inserting into the database (1):", err)
			r.Header.Set("Cache-Control", "no-cache")
			http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
		}
		return
	}

	if _, err := db.Exec("INSERT OR IGNORE INTO users (id, banchoId) values (?, ?)", discordId, data["id"]); err != nil {
		fmt.Println("Error while inserting into the database (2):", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, "/error", http.StatusPermanentRedirect)
	}

	http.Redirect(w, r, "/success", http.StatusPermanentRedirect)
}
