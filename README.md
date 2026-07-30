# 🏠 Fortmont Home

## 🚀 What is Fortmont Home?

Fortmont Home is a modern, easy-to-use dashboard designed to help you monitor and manage your homelab while keeping you up to date with your infrastructure and organisation's services—all from one place.

Whether you're managing a small home server or a larger environment, Fortmont Home aims to provide a clean, fast, and enjoyable experience.

---

# ✨ Features

## 🖥️ Infrastructure & Components

* 📊 **Live Proxmox Cluster Dashboard** with real-time information about your virtual machines, cluster health, tickets, and homelab status.
* 🔌 Dedicated management pages for services including **Proxmox**, **UniFi**, **Reverse Proxy**, **DNS Server**, and many more integrations.
* 📧 A fully featured **mail client** that connects to your preferred mail server, complete with modern composing and editing capabilities.
* 🎫 A complete **ticketing system** featuring live comments, notifications, activity history, and a workflow similar to enterprise helpdesk platforms.

---

## 🔒 Security

Security is one of the primary focuses of Fortmont Home.

* 🔐 Sensitive information is encrypted before being transmitted and remains encrypted while stored in the database.
* 🔑 Local account authentication with **Two-Factor Authentication (2FA)** support.
* ☁️ Native **Microsoft Entra ID** authentication using NextAuth.
* 📧 Email-based Two-Factor Authentication support.
* 👥 Multi-user support with an early preview of **Role-Based Access Control (RBAC)**.

Current development progress:

* Entra ID 2FA improvements — Issue **#9**
* RBAC implementation — Issue **#10**

---

# 🛣️ Roadmap

Fortmont Home is actively developed and receives regular improvements, bug fixes, and new features.

You can follow development by visiting the **GitHub Issues** page.

Want to try the latest features? Development branches are available, but please note:

* 🧪 Feature branches are experimental.
* 🐛 They may contain unfinished functionality or bugs.
* ⚠️ They should **not** be used in production environments.

Current focus:

* 🚧 Issue **#8** — Ongoing bug fixes and feature completion.

---

# 🚀 Getting Started

## ☁️ Hosted Instance (Cloud)

A hosted version of Fortmont Home is planned but is **not yet available**, as the project is currently in **Beta**.

When available, it will be hosted on **Microsoft Azure** using secure HTTPS infrastructure.

---

## 💻 Local Installation

### Requirements

Before running Fortmont Home locally, you'll need:

* A locally running **Fortmont API Server** (default: port **3000**).
* At least **2 GB RAM**.
* Approximately **15 GB** of free disk space.
* **Node.js** installed.
* **pnpm** installed globally.

### Installation

```bash
# Clone the repository
git clone https://github.com/nfworking/fortmont-home.git

# Enter the project
cd fortmont-home

# Install pnpm globally (if required)
npm install -g pnpm

# Copy the environment file
cp env.example .env

# Install dependencies and generate Prisma Client
pnpm install
pnpm prisma generate

# Build and start the application
pnpm build
pnpm start
```

---

# 🔄 Updating

To update your local installation:

1. Stop the running server.
2. Pull the latest changes.

```bash
git pull
```

---

# 📚 Documentation

> **Note:** Documentation is still being written and expanded.

You can follow documentation progress in the **Fortmont Docs** repository.

Documentation:
https://docs.fortmont.me/fortmont-home

---

# 🛠️ Development Tools

During development, AI-assisted tools have been used to help with:

* 🔍 Security reviews
* 🐞 Bug fixing
* 🎨 Interface development
* ⚙️ Low-level implementation assistance

All architecture, design decisions, and final implementations are reviewed and developed as part of the project.

---

# ❤️ Support

Thanks for checking out Fortmont Home!

If you encounter any issues, have questions, or would like to suggest a feature, please open a GitHub Issue or feel free to reach out directly.

Even if you're just stopping by to have a look—welcome! 😊

---

# 📄 Licensing

Fortmont Home does not currently have an official open-source licence.

Until a licence is chosen, **all rights are reserved**.

If you believe the project's branding, naming, or assets conflict with your own project or intellectual property, please contact me directly. I'll happily discuss the issue and, if necessary, rebrand the project to avoid any conflicts.

Thank you for respecting the project while it continues to grow! 💙
