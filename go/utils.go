package main

import (
	"fmt"
	"math/rand"
	"time"
	"regexp"
)

// MixmlaalUtils 提供项目通用工具方法
type MixmlaalUtils struct{}

// NewMixmlaalUtils 创建新的工具实例
func NewMixmlaalUtils() *MixmlaalUtils {
	return &MixmlaalUtils{}
}

// GenerateUniqueId 生成唯一ID
func (u *MixmlaalUtils) GenerateUniqueId() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%d-%d", time.Now().Unix(), rand.Intn(10000))
}

// IsValidEmail 验证邮箱格式
func (u *MixmlaalUtils) IsValidEmail(email string) bool {
	pattern := `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
	match, _ := regexp.MatchString(pattern, email)
	return match
}

// HashString 计算字符串哈希值
func (u *MixmlaalUtils) HashString(input string) int {
	hash := 0
	for _, c := range input {
		hash = 31*hash + int(c)
	}
	return hash
}

// FormatTimestamp 格式化时间戳
func (u *MixmlaalUtils) FormatTimestamp(timestamp int64, format string) string {
	if format == "" {
		format = "2006-01-02 15:04:05"
	}
	return time.Unix(timestamp, 0).Format(format)
}

// Test 测试方法
func (u *MixmlaalUtils) Test() {
	fmt.Println("MIXMLAAL Go Utils Test")
	fmt.Println("Unique ID:", u.GenerateUniqueId())
	fmt.Println("Email test (test@example.com):", u.IsValidEmail("test@example.com"))
	fmt.Println("Hash test:", u.HashString("MIXMLAAL"))
	fmt.Println("Timestamp:", u.FormatTimestamp(time.Now().Unix(), ""))
}

// main 主函数
func main() {
	utils := NewMixmlaalUtils()
	utils.Test()
}
