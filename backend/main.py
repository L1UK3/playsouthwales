if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:create_app", host="127.0.0.1", port=5000, reload=True)
