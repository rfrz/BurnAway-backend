-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "experience_years" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "daily_work_hours" DOUBLE PRECISION NOT NULL,
    "sleep_hours" DOUBLE PRECISION NOT NULL,
    "caffeine_intake" INTEGER NOT NULL,
    "bugs_per_day" INTEGER NOT NULL,
    "commits_per_day" INTEGER NOT NULL,
    "meetings_per_day" INTEGER NOT NULL,
    "screen_time" DOUBLE PRECISION NOT NULL,
    "exercise_hours" DOUBLE PRECISION NOT NULL,
    "stress_level" DOUBLE PRECISION NOT NULL,
    "burnout_level" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "stress_estimate" DOUBLE PRECISION NOT NULL,
    "probabilities" JSONB NOT NULL,
    "advice" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
