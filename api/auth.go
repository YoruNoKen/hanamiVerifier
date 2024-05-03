package api

import (
	"hanami-verifier/utils"
	"net/http"
)

func Auth(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, utils.OauthConfig.AuthCodeURL(r.URL.Query().Get("state")), http.StatusTemporaryRedirect)
}
