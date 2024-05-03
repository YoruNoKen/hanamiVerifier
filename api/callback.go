package api

import (
	"fmt"
	"hanami-verifier/utils"
	"log"
	"net/http"
)

func Callback(w http.ResponseWriter, r *http.Request) {

	code := r.URL.Query().Get("code")
	discordId, err := utils.GetIdFromState(r.URL.Query().Get("state"))
	if err != nil || discordId == nil {
		log.Println("Error getting discord ID from state:", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, utils.ServeHtml(r, "error"), http.StatusPermanentRedirect)
		return
	}

	tokenStruct, err := utils.OauthConfig.Exchange(r.Context(), code)
	if err != nil {
		log.Println("Error exchanging code:", err)
		r.Header.Set("Cache-Control", "no-cache")
		http.Redirect(w, r, utils.ServeHtml(r, "error"), http.StatusPermanentRedirect)
		return
	}

	accessToken := tokenStruct.AccessToken
	fmt.Println(accessToken, *discordId)
}
