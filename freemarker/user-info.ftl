<!-- MIXMLAAL FreeMarker Template -->
<!-- 用户信息页面模板 -->

<!DOCTYPE html>
<html>
<head>
    <title>MIXMLAAL - 用户信息</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4CAF50;
        }
        .user-info {
            margin-top: 20px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        .btn {
            display: inline-block;
            padding: 8px 16px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .btn:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>用户信息</h1>
        
        <#if user??>
            <div class="user-info">
                <div class="info-item">
                    <span class="info-label">用户名:</span>
                    ${user.username}
                </div>
                <div class="info-item">
                    <span class="info-label">邮箱:</span>
                    ${user.email}
                </div>
                <div class="info-item">
                    <span class="info-label">注册时间:</span>
                    ${user.createdAt?datetime}
                </div>
                <div class="info-item">
                    <span class="info-label">状态:</span>
                    <#if user.active>
                        活跃
                    <#else>
                        非活跃
                    </#if>
                </div>
            </div>
            
            <a href="/users/edit/${user.id}" class="btn">编辑信息</a>
        <#else>
            <p>用户信息不存在</p>
        </#if>
        
        <h2>最近活动</h2>
        <#if activities?? && activities?size > 0>
            <ul>
                <#list activities as activity>
                    <li>${activity.timestamp?datetime}: ${activity.action}</li>
                </#list>
            </ul>
        <#else>
            <p>暂无活动记录</p>
        </#if>
    </div>
</body>
</html>
