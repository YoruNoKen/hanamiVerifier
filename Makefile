.PHONY: build
build: clean
	@git pull
	go build -o verify_yorunoken_com

.PHONY: run
run: build
	@./verify_yorunoken_com

.PHONY: clean
clean:
	rm -rf verify_yorunoken_com