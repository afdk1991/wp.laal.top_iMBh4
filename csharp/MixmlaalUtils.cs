using System;
using System.Text.RegularExpressions;

namespace Mixmlaal.Utils
{
    /// <summary>
    /// MIXMLAAL C# Utility Class
    /// 提供项目通用工具方法
    /// </summary>
    public class MixmlaalUtils
    {
        /// <summary>
        /// 生成唯一ID
        /// </summary>
        /// <returns>唯一ID字符串</returns>
        public static string GenerateUniqueId()
        {
            return $"{DateTime.Now.Ticks}-{new Random().Next(1000, 9999)}";
        }

        /// <summary>
        /// 验证邮箱格式
        /// </summary>
        /// <param name="email">邮箱地址</param>
        /// <returns>是否有效</returns>
        public static bool IsValidEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;
            
            string pattern = @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}";
            return Regex.IsMatch(email, pattern);
        }

        /// <summary>
        /// 计算字符串哈希值
        /// </summary>
        /// <param name="input">输入字符串</param>
        /// <returns>哈希值</returns>
        public static int HashString(string input)
        {
            if (string.IsNullOrEmpty(input))
                return 0;
            
            int hash = 0;
            foreach (char c in input)
            {
                hash = 31 * hash + c;
            }
            return hash;
        }

        /// <summary>
        /// 格式化时间戳
        /// </summary>
        /// <param name="timestamp">时间戳</param>
        /// <param name="format">格式</param>
        /// <returns>格式化后的时间</returns>
        public static string FormatTimestamp(long timestamp, string format = "yyyy-MM-dd HH:mm:ss")
        {
            DateTime dateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            dateTime = dateTime.AddSeconds(timestamp).ToLocalTime();
            return dateTime.ToString(format);
        }

        /// <summary>
        /// 测试方法
        /// </summary>
        public static void Test()
        {
            Console.WriteLine("MIXMLAAL C# Utils Test");
            Console.WriteLine($"Unique ID: {GenerateUniqueId()}");
            Console.WriteLine($"Email test (test@example.com): {IsValidEmail("test@example.com")}");
            Console.WriteLine($"Hash test: {HashString("MIXMLAAL")}");
            Console.WriteLine($"Timestamp: {FormatTimestamp(DateTimeOffset.Now.ToUnixTimeSeconds())}");
        }
    }

    /// <summary>
    /// 主类
    /// </summary>
    class Program
    {
        /// <summary>
        /// 主方法
        /// </summary>
        static void Main(string[] args)
        {
            MixmlaalUtils.Test();
            Console.ReadLine();
        }
    }
}
