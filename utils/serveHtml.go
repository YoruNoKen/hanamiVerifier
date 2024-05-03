package utils

import (
	"fmt"
	"net/http"
)

func ServeHtml(r *http.Request, path string) string {
	p := "." + r.URL.Path

	if p == "./" || p == "./"+path {
		p = fmt.Sprintf("./web/%s/%s.html", path, path)
	}

	return p
}
