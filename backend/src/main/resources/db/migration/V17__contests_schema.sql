-- Конкурсы и заявки на участие
-- Сотрудник Эко Оператора заводит конкурс, граждане/юрлица подают заявки публично

CREATE TABLE contests (
    id                      BIGSERIAL PRIMARY KEY,
    title                   VARCHAR(255) NOT NULL,
    description             TEXT NOT NULL,
    conditions              TEXT,
    grant_amount            NUMERIC(15, 2),
    grant_currency          VARCHAR(10) DEFAULT 'KGS',
    deadline                TIMESTAMP NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    regulations_object_key  VARCHAR(255),
    regulations_file_name   VARCHAR(255),
    created_by_id           BIGINT REFERENCES users(id),
    created_at              TIMESTAMP NOT NULL,
    updated_at              TIMESTAMP NOT NULL
);

CREATE INDEX idx_contests_status   ON contests (status);
CREATE INDEX idx_contests_deadline ON contests (deadline);

CREATE TABLE contest_applications (
    id                  BIGSERIAL PRIMARY KEY,
    number              VARCHAR(30)  NOT NULL UNIQUE,
    contest_id          BIGINT       NOT NULL REFERENCES contests(id),
    last_name           VARCHAR(100) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    middle_name         VARCHAR(100),
    phone               VARCHAR(20)  NOT NULL,
    email               VARCHAR(150) NOT NULL,
    document_object_key VARCHAR(255) NOT NULL,
    document_file_name  VARCHAR(255) NOT NULL,
    document_size       BIGINT,
    status              VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    comment             TEXT,
    reviewed_by_id      BIGINT       REFERENCES users(id),
    reviewed_at         TIMESTAMP,
    created_at          TIMESTAMP    NOT NULL,
    updated_at          TIMESTAMP    NOT NULL
);

CREATE INDEX idx_contest_apps_contest ON contest_applications (contest_id);
CREATE INDEX idx_contest_apps_status  ON contest_applications (status);
CREATE INDEX idx_contest_apps_email   ON contest_applications (email);
CREATE INDEX idx_contest_apps_number  ON contest_applications (number);
