-- ============================================
-- V14__remove_non_payer_accounts.sql
-- Удаление лицевых счетов для не-плательщиков
-- Лицевые счета должны быть только у компаний с ролью BUSINESS
-- ============================================

-- Удалить транзакции связанные со счетами не-плательщиков
DELETE FROM transactions
WHERE account_id IN (
    SELECT a.id FROM accounts a
    WHERE NOT EXISTS (
        SELECT 1 FROM users u
        WHERE u.company_id = a.company_id
          AND u.role = 'BUSINESS'
    )
);

-- Удалить счета не-плательщиков
DELETE FROM accounts
WHERE NOT EXISTS (
    SELECT 1 FROM users u
    WHERE u.company_id = accounts.company_id
      AND u.role = 'BUSINESS'
);
