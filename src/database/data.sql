-- Create ENUM type
CREATE TYPE day_name_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
CREATE TYPE user_role AS ENUM ('admin', 'ustadz', 'santri');

-- Table: users (authentication for ALL users: admin, ustadz, santri)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- store hashed password, e.g., bcrypt
    role user_role NOT NULL DEFAULT 'santri',
    name VARCHAR(100) NOT NULL, -- full name
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: ustadz (extends users with ustadz-specific fields)
CREATE TABLE ustadz (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE, -- link to users table
    specialization VARCHAR(100), -- optional: bidang keahlian
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: santri (extends users with santri-specific fields)
CREATE TABLE santri (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE, -- link to users table
    class VARCHAR(50) NOT NULL, -- e.g., "7A", "8B", "9C", etc.
    halaqah_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    FOREIGN KEY (halaqah_id) REFERENCES halaqah(id) ON DELETE CASCADE
);

-- Table: halaqah (study circle/group)
CREATE TABLE halaqah (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Halaqah 1", "Halaqah Fajr", etc.
    ustadz_id INTEGER NOT NULL,
    FOREIGN KEY (ustadz_id) REFERENCES ustadz(id) ON DELETE CASCADE
);

-- Table: ziyadah (new memorization)
CREATE TABLE ziyadah (
    id SERIAL PRIMARY KEY,
    santri_id INTEGER NOT NULL,
    date DATE NOT NULL,
    juz INTEGER NOT NULL, -- Quranic juz (1-30)
    start_page INTEGER NOT NULL,
    end_page INTEGER NOT NULL,
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
);

-- Table: murajaah (review/repetition of memorized pages)
CREATE TABLE murajaah (
    id SERIAL PRIMARY KEY,
    santri_id INTEGER NOT NULL,
    date DATE NOT NULL,
    juz INTEGER NOT NULL, -- Quranic juz (1-30)
    start_page INTEGER NOT NULL,
    end_page INTEGER NOT NULL,
    FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
);