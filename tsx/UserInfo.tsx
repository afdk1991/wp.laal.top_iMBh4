import React, { useState, useEffect } from 'react';
import { Button, Card, Input, List, Avatar, Divider } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  active: boolean;
}

interface Activity {
  id: number;
  action: string;
  timestamp: string;
}

interface UserInfoProps {
  userId: number;
}

const UserInfo: React.FC<UserInfoProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
    fetchActivities();
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError('Failed to load user information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/activities`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  const handleEdit = () => {
    // 导航到编辑页面
    window.location.href = `/users/edit/${userId}`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-info-container">
      <h1>MIXMLAAL - 用户信息</h1>
      
      {user ? (
        <Card
          title={<div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size={64} icon={<UserOutlined />} />
            <div style={{ marginLeft: 16 }}>
              <h2>{user.username}</h2>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {user.active ? (
                  <CheckCircleOutlined style={{ color: 'green', marginRight: 8 }} />
                ) : (
                  <CloseCircleOutlined style={{ color: 'red', marginRight: 8 }} />
                )}
                <span>{user.active ? '活跃' : '非活跃'}</span>
              </div>
            </div>
          </div>}
          extra={<Button type="primary" onClick={handleEdit}>编辑信息</Button>}
          style={{ marginBottom: 24 }}
        >
          <List
            itemLayout="horizontal"
            dataSource={[
              { label: '邮箱', value: user.email, icon: <MailOutlined /> },
              { label: '注册时间', value: new Date(user.createdAt).toLocaleString(), icon: <CalendarOutlined /> }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={item.icon}
                  title={item.label}
                  description={item.value}
                />
              </List.Item>
            )}
          />
        </Card>
      ) : (
        <Card style={{ marginBottom: 24 }}>
          <p>用户信息不存在</p>
        </Card>
      )}

      <Card title="最近活动">
        {activities.length > 0 ? (
          <List
            dataSource={activities}
            renderItem={(activity) => (
              <List.Item>
                <List.Item.Meta
                  title={activity.action}
                  description={new Date(activity.timestamp).toLocaleString()}
                />
              </List.Item>
            )}
          />
        ) : (
          <p style={{ textAlign: 'center', padding: '24px 0' }}>暂无活动记录</p>
        )}
      </Card>

      <style jsx>{`
        .user-info-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
          background-color: #f5f5f5;
          min-height: 100vh;
        }
        h1 {
          color: #4CAF50;
          margin-bottom: 24px;
        }
        .loading,
        .error {
          text-align: center;
          padding: 48px 0;
          font-size: 18px;
        }
        .error {
          color: red;
        }
      `}</style>
    </div>
  );
};

export default UserInfo;
