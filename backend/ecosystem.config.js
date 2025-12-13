module.exports = {
    apps: [{
        name: "research-lab-backend",
        script: "python3",
        args: "-m uvicorn app.main:app --host 0.0.0.0 --port 9191",
        cwd: "./"
    }]
}
