package com.mixmlaal.app;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class IntegratedServicesActivity extends AppCompatActivity {

    private TextView statsPackages;
    private TextView statsSubscribers;
    private TextView statsRevenue;
    private TextView statsOrders;
    private Button addPackageBtn;
    private Button addSubscriptionBtn;
    private RecyclerView packagesRecyclerView;
    private RecyclerView subscriptionsRecyclerView;
    private RecyclerView ordersRecyclerView;

    private List<Package> packagesList;
    private List<Subscription> subscriptionsList;
    private List<Order> ordersList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_integrated_services);

        // 初始化UI组件
        statsPackages = findViewById(R.id.stats_packages);
        statsSubscribers = findViewById(R.id.stats_subscribers);
        statsRevenue = findViewById(R.id.stats_revenue);
        statsOrders = findViewById(R.id.stats_orders);
        addPackageBtn = findViewById(R.id.add_package_btn);
        addSubscriptionBtn = findViewById(R.id.add_subscription_btn);
        packagesRecyclerView = findViewById(R.id.packages_recycler_view);
        subscriptionsRecyclerView = findViewById(R.id.subscriptions_recycler_view);
        ordersRecyclerView = findViewById(R.id.orders_recycler_view);

        // 设置统计数据
        statsPackages.setText("8");
        statsSubscribers.setText("128");
        statsRevenue.setText("15800");
        statsOrders.setText("256");

        // 初始化数据
        initData();

        // 设置适配器
        setupAdapters();

        // 设置按钮点击事件
        addPackageBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 打开添加套餐页面
                Toast.makeText(IntegratedServicesActivity.this, "添加套餐", Toast.LENGTH_SHORT).show();
            }
        });

        addSubscriptionBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 打开添加订阅页面
                Toast.makeText(IntegratedServicesActivity.this, "添加订阅", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void initData() {
        // 初始化套餐数据
        packagesList = new ArrayList<>();
        packagesList.add(new Package(1, "基础套餐", 99, "出行服务, 美食服务", "active", "2024-01-01"));
        packagesList.add(new Package(2, "高级套餐", 199, "出行服务, 美食服务, 跑腿服务", "active", "2024-01-02"));
        packagesList.add(new Package(3, "尊享套餐", 299, "出行服务, 美食服务, 跑腿服务, 本地商城, AI智能助手", "active", "2024-01-03"));
        packagesList.add(new Package(4, "企业套餐", 999, "出行服务, 美食服务, 跑腿服务, 本地商城, AI智能助手, 会员特权", "inactive", "2024-01-04"));

        // 初始化订阅数据
        subscriptionsList = new ArrayList<>();
        subscriptionsList.add(new Subscription(1, 1001, "张三", "高级套餐", "2024-01-01", "2024-02-01", "active"));
        subscriptionsList.add(new Subscription(2, 1002, "李四", "尊享套餐", "2024-01-02", "2024-02-02", "active"));
        subscriptionsList.add(new Subscription(3, 1003, "王五", "基础套餐", "2023-12-01", "2024-01-01", "expired"));
        subscriptionsList.add(new Subscription(4, 1004, "赵六", "高级套餐", "2024-01-03", "2024-02-03", "active"));

        // 初始化订单数据
        ordersList = new ArrayList<>();
        ordersList.add(new Order("ORDER001", 1001, "张三", "高级套餐", 105, "completed", "paid", "2024-01-01 10:00:00"));
        ordersList.add(new Order("ORDER002", 1002, "李四", "尊享套餐", 134, "pending", "unpaid", "2024-01-02 12:30:00"));
        ordersList.add(new Order("ORDER003", 1003, "王五", "基础套餐", 166, "processing", "paid", "2024-01-03 18:00:00"));
    }

    private void setupAdapters() {
        // 设置套餐适配器
        PackageAdapter packageAdapter = new PackageAdapter(packagesList, this);
        packagesRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        packagesRecyclerView.setAdapter(packageAdapter);

        // 设置订阅适配器
        SubscriptionAdapter subscriptionAdapter = new SubscriptionAdapter(subscriptionsList, this);
        subscriptionsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        subscriptionsRecyclerView.setAdapter(subscriptionAdapter);

        // 设置订单适配器
        OrderAdapter orderAdapter = new OrderAdapter(ordersList, this);
        ordersRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        ordersRecyclerView.setAdapter(orderAdapter);
    }

    // 套餐数据类
    public static class Package {
        int id;
        String name;
        double price;
        String services;
        String status;
        String createdAt;

        public Package(int id, String name, double price, String services, String status, String createdAt) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.services = services;
            this.status = status;
            this.createdAt = createdAt;
        }
    }

    // 订阅数据类
    public static class Subscription {
        int id;
        int userId;
        String userName;
        String packageName;
        String subscribeTime;
        String expireTime;
        String status;

        public Subscription(int id, int userId, String userName, String packageName, String subscribeTime, String expireTime, String status) {
            this.id = id;
            this.userId = userId;
            this.userName = userName;
            this.packageName = packageName;
            this.subscribeTime = subscribeTime;
            this.expireTime = expireTime;
            this.status = status;
        }
    }

    // 订单数据类
    public static class Order {
        String id;
        int userId;
        String userName;
        String packageName;
        double totalAmount;
        String orderStatus;
        String paymentStatus;
        String createdAt;

        public Order(String id, int userId, String userName, String packageName, double totalAmount, String orderStatus, String paymentStatus, String createdAt) {
            this.id = id;
            this.userId = userId;
            this.userName = userName;
            this.packageName = packageName;
            this.totalAmount = totalAmount;
            this.orderStatus = orderStatus;
            this.paymentStatus = paymentStatus;
            this.createdAt = createdAt;
        }
    }
}
