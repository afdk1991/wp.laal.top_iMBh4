<?php
/**
 * MIXMLAAL PHP Utility Class
 * 提供项目通用工具方法
 */
class MixmlaalUtils {
    
    /**
     * 生成唯一ID
     * @return string 唯一ID
     */
    public static function generateUniqueId() {
        return time() . '-' . mt_rand(1000, 9999);
    }
    
    /**
     * 验证邮箱格式
     * @param string $email 邮箱地址
     * @return bool 是否有效
     */
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * 计算字符串哈希值
     * @param string $input 输入字符串
     * @return int 哈希值
     */
    public static function hashString($input) {
        return crc32($input);
    }
    
    /**
     * 格式化时间戳
     * @param int $timestamp 时间戳
     * @param string $format 格式
     * @return string 格式化后的时间
     */
    public static function formatTimestamp($timestamp, $format = 'Y-m-d H:i:s') {
        return date($format, $timestamp);
    }
    
    /**
     * 数组转JSON
     * @param array $data 数组
     * @return string JSON字符串
     */
    public static function toJson($data) {
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    
    /**
     * JSON转数组
     * @param string $json JSON字符串
     * @return array 数组
     */
    public static function fromJson($json) {
        return json_decode($json, true);
    }
    
    /**
     * 测试方法
     */
    public static function test() {
        echo "MIXMLAAL PHP Utils Test\n";
        echo "Unique ID: " . self::generateUniqueId() . "\n";
        echo "Email test (test@example.com): " . (self::isValidEmail('test@example.com') ? 'Valid' : 'Invalid') . "\n";
        echo "Hash test: " . self::hashString('MIXMLAAL') . "\n";
        echo "Timestamp: " . self::formatTimestamp(time()) . "\n";
    }
}

// 测试代码
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    MixmlaalUtils::test();
}
