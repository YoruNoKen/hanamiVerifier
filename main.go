package main

import (
	"fmt"
	"hanami-verifier/api"
	"hanami-verifier/handlers"
	"hanami-verifier/utils"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		fmt.Println("Error loading .env, trying with .env.local")
		if err := godotenv.Load(".env.local"); err != nil {
			fmt.Println("Error loading .env.local, exiting application.")
			return
		}
	}

	utils.OAuthInit()

	http.HandleFunc("/", handlers.Index)
	http.HandleFunc("/error", handlers.Error)
	http.HandleFunc("/success", handlers.Success)

	http.HandleFunc("/auth/osu", api.Auth)
	http.HandleFunc("/auth/osu/cb", api.Callback)

	fmt.Println("Listening on http://localhost:3002")
	http.ListenAndServe(utils.GetPort("3002"), nil)
}
