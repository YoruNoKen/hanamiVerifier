package handlers

import (
	"hanami-verifier/utils"
	"net/http"
)

func Success(w http.ResponseWriter, r *http.Request) {
	r.Header.Set("Cache-Control", "no-cache")
	http.ServeFile(w, r, utils.ServeHtml(r, "success"))
}
