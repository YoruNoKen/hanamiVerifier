package utils

import (
	"os"
	"strings"
)

func GetIdFromState(state string) (*string, error) {
	isDev := os.Getenv("DEV") == "1"

	filePath := "/root/users_cache.txt"
	if isDev {
		filePath = "./users_cache.txt"
	}

	idFiles, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var foundId *string

	lines := strings.Split(string(idFiles), "\n")
	for _, line := range lines {
		currState, currId, _ := strings.Cut(line, "=")

		if currState == state {
			foundId = &currId
			break
		}
	}

	return foundId, nil
}
