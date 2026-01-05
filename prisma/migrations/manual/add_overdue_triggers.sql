-- Migration: Add triggers to automatically update payment and utility bill status to 'overdue'
-- These triggers check and update status on INSERT/UPDATE operations

-- =====================================================
-- DROP existing triggers and functions if they exist
-- =====================================================
DROP TRIGGER IF EXISTS trigger_check_payment_overdue ON "Payment";
DROP TRIGGER IF EXISTS trigger_check_utility_bill_overdue ON "UtilityBill";
DROP FUNCTION IF EXISTS check_payment_overdue();
DROP FUNCTION IF EXISTS check_utility_bill_overdue();

-- =====================================================
-- FUNCTION: Check single payment on insert/update
-- Automatically sets status to 'overdue' if due date has passed
-- =====================================================
CREATE OR REPLACE FUNCTION check_payment_overdue()
RETURNS TRIGGER AS $$
BEGIN
    -- If inserting/updating a pending payment with past due date, set to overdue
    IF NEW.status = 'pending' AND NEW."dueDate" < CURRENT_DATE THEN
        NEW.status := 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Check single utility bill on insert/update
-- Automatically sets status to 'overdue' if due date has passed
-- =====================================================
CREATE OR REPLACE FUNCTION check_utility_bill_overdue()
RETURNS TRIGGER AS $$
BEGIN
    -- If inserting/updating a pending utility bill with past due date, set to overdue
    IF NEW.status = 'pending' AND NEW."dueDate" < CURRENT_DATE THEN
        NEW.status := 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Check payment status on INSERT/UPDATE
-- This ensures any new or updated payment is immediately set to overdue if past due
-- =====================================================
CREATE TRIGGER trigger_check_payment_overdue
    BEFORE INSERT OR UPDATE ON "Payment"
    FOR EACH ROW
    EXECUTE FUNCTION check_payment_overdue();

-- =====================================================
-- TRIGGER: Check utility bill status on INSERT/UPDATE
-- This ensures any new or updated utility bill is immediately set to overdue if past due
-- =====================================================
CREATE TRIGGER trigger_check_utility_bill_overdue
    BEFORE INSERT OR UPDATE ON "UtilityBill"
    FOR EACH ROW
    EXECUTE FUNCTION check_utility_bill_overdue();

-- =====================================================
-- Initial run: Update all existing overdue items
-- =====================================================
UPDATE "Payment"
SET status = 'overdue', "updatedAt" = NOW()
WHERE status = 'pending' 
AND "dueDate" < CURRENT_DATE;

UPDATE "UtilityBill"
SET status = 'overdue', "updatedAt" = NOW()
WHERE status = 'pending' 
AND "dueDate" < CURRENT_DATE;
