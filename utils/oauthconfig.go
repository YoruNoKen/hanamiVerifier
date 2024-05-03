package utils

import (
	"os"

	"golang.org/x/oauth2"
)

var OauthConfig *oauth2.Config

func OAuthInit() {
	OauthConfig = &oauth2.Config{
		ClientID:     os.Getenv("CLIENT_ID"),
		ClientSecret: os.Getenv("CLIENT_SECRET"),
		RedirectURL:  os.Getenv("CALLBACK_URL"),
		Scopes:       []string{"identify"},
		Endpoint: oauth2.Endpoint{
			AuthURL:   "https://osu.ppy.sh/oauth/authorize",
			TokenURL:  "https://osu.ppy.sh/oauth/token",
			AuthStyle: oauth2.AuthStyleInHeader,
		},
	}
}
