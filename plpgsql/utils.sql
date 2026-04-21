-- MIXMLAAL PLpgSQL Implementation
-- 存储过程和函数定义

-- 创建扩展（如果不存在）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 生成唯一ID函数
CREATE OR REPLACE FUNCTION mixmlaal.generate_unique_id()
RETURNS TEXT AS $$
BEGIN
    RETURN CONCAT(EXTRACT(EPOCH FROM NOW())::BIGINT, '-', FLOOR(RANDOM() * 10000)::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- 验证邮箱格式函数
CREATE OR REPLACE FUNCTION mixmlaal.is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- 计算字符串哈希值函数
CREATE OR REPLACE FUNCTION mixmlaal.hash_string(input TEXT)
RETURNS INTEGER AS $$
DECLARE
    hash INTEGER := 0;
    i INTEGER := 1;
BEGIN
    WHILE i <= LENGTH(input) LOOP
        hash := 31 * hash + ASCII(SUBSTRING(input FROM i FOR 1));
        i := i + 1;
    END LOOP;
    RETURN hash;
END;
$$ LANGUAGE plpgsql;

-- 格式化时间戳函数
CREATE OR REPLACE FUNCTION mixmlaal.format_timestamp(timestamp BIGINT, format TEXT DEFAULT 'YYYY-MM-DD HH24:MI:SS')
RETURNS TEXT AS $$
BEGIN
    RETURN TO_CHAR(TO_TIMESTAMP(timestamp), format);
END;
$$ LANGUAGE plpgsql;

-- 获取用户信息函数
CREATE OR REPLACE FUNCTION mixmlaal.get_user_info(user_id INTEGER)
RETURNS TABLE(
    id INTEGER,
    username TEXT,
    email TEXT,
    created_at TIMESTAMP,
    active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.email,
        u.created_at,
        u.active
    FROM users u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 测试函数
CREATE OR REPLACE FUNCTION mixmlaal.test_utils()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    result := 'MIXMLAAL PLpgSQL Utils Test\n';
    result := result || 'Unique ID: ' || mixmlaal.generate_unique_id() || '\n';
    result := result || 'Email test (test@example.com): ' || mixmlaal.is_valid_email('test@example.com') || '\n';
    result := result || 'Hash test: ' || mixmlaal.hash_string('MIXMLAAL') || '\n';
    result := result || 'Timestamp: ' || mixmlaal.format_timestamp(EXTRACT(EPOCH FROM NOW())::BIGINT) || '\n';
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 创建schema（如果不存在）
CREATE SCHEMA IF NOT EXISTS mixmlaal;

-- 授予执行权限
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA mixmlaal TO PUBLIC;

-- 测试调用示例
-- SELECT mixmlaal.test_utils();
