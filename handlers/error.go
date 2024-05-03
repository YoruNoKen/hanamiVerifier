package handlers

import (
	"hanami-verifier/utils"
	"net/http"
)

func Error(w http.ResponseWriter, r *http.Request) {
	r.Header.Set("Cache-Control", "no-cache")
	http.ServeFile(w, r, utils.ServeHtml(r, "error"))
}
