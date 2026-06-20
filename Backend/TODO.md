# Worker Registration & Hiring Fix Task

## Steps:
- [x] Step 1: Update src/models/worker.models.js (add avatar field, change userid to hiredBy array)
- [x] Step 2: Update src/models/user.models.js (change WorkerID to hiredWorkers array)
- [x] Step 3: Rewrite src/controllers/worker.controllers.js (implement register, loginWorker, logoutWorker, generate tokens for Worker)
- [x] Step 4: Update src/middlewares/auth.middleware.js (make generic for User/Worker or add workerVerifyJWT)
- [x] Step 5: Test endpoints
- [ ] Step 6: Complete task
