#!/usr/bin/env node

const symlinkDir = require("symlink-dir");
const { join } = require("path");
const { existsSync } = require("fs");

const apps = ["cms-api", "discovery-api", "outbox-publisher", "sync-worker"];

async function setupEnvSymlinks() {
  const rootEnvPath = join(__dirname, "..", ".env");

  if (!existsSync(rootEnvPath)) {
    console.log("⚠️  No .env file found at project root");
    console.log("💡 Please create a .env file first");
    return;
  }

  console.log("🔗 Setting up .env symlinks for development...");

  for (const app of apps) {
    const appDir = join(__dirname, "..", "apps", app);
    const targetEnvPath = join(appDir, ".env");

    try {
      await symlinkDir(rootEnvPath, targetEnvPath);
      console.log(`✅ Created symlink: apps/${app}/.env -> ../../.env`);
    } catch (error) {
      if (error.code === "EEXIST") {
        console.log(`ℹ️  Symlink already exists: apps/${app}/.env`);
      } else {
        console.error(`❌ Failed to create symlink for ${app}:`, error.message);
      }
    }
  }

  console.log("🎉 Environment symlinks setup complete!");
}

setupEnvSymlinks().catch(console.error);
