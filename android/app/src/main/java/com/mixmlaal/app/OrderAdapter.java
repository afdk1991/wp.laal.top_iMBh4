package com.mixmlaal.app;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.OrderViewHolder> {

    private List<IntegratedServicesActivity.Order> ordersList;
    private Context context;

    public OrderAdapter(List<IntegratedServicesActivity.Order> ordersList, Context context) {
        this.ordersList = ordersList;
        this.context = context;
    }

    @Override
    public OrderViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_order, parent, false);
        return new OrderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(OrderViewHolder holder, int position) {
        IntegratedServicesActivity.Order order = ordersList.get(position);
        holder.idTextView.setText(order.id);
        holder.userIdTextView.setText(String.valueOf(order.userId));
        holder.userNameTextView.setText(order.userName);
        holder.packageNameTextView.setText(order.packageName);
        holder.totalAmountTextView.setText(String.valueOf(order.totalAmount) + "元");
        holder.orderStatusTextView.setText(order.orderStatus);
        holder.paymentStatusTextView.setText(order.paymentStatus);
        holder.createdAtTextView.setText(order.createdAt);

        // 设置状态颜色
        setStatusColor(holder.orderStatusTextView, order.orderStatus);
        setStatusColor(holder.paymentStatusTextView, order.paymentStatus);

        holder.editButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "编辑订单: " + order.id, Toast.LENGTH_SHORT).show();
            }
        });

        holder.deleteButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "删除订单: " + order.id, Toast.LENGTH_SHORT).show();
            }
        });

        holder.viewButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "查看订单详情: " + order.id, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setStatusColor(TextView textView, String status) {
        switch (status) {
            case "active":
            case "completed":
            case "paid":
                textView.setBackgroundColor(0xFFc6f6d5);
                textView.setTextColor(0xFF22543d);
                break;
            case "inactive":
            case "expired":
            case "unpaid":
                textView.setBackgroundColor(0xFFfed7d7);
                textView.setTextColor(0xFF742a2a);
                break;
            case "pending":
            case "processing":
                textView.setBackgroundColor(0xFFfeebc8);
                textView.setTextColor(0xFF7c3aed);
                break;
            default:
                textView.setBackgroundColor(0xFFe2e8f0);
                textView.setTextColor(0xFF4a5568);
                break;
        }
    }

    @Override
    public int getItemCount() {
        return ordersList.size();
    }

    public static class OrderViewHolder extends RecyclerView.ViewHolder {
        TextView idTextView;
        TextView userIdTextView;
        TextView userNameTextView;
        TextView packageNameTextView;
        TextView totalAmountTextView;
        TextView orderStatusTextView;
        TextView paymentStatusTextView;
        TextView createdAtTextView;
        Button editButton;
        Button deleteButton;
        Button viewButton;

        public OrderViewHolder(View itemView) {
            super(itemView);
            idTextView = itemView.findViewById(R.id.order_id);
            userIdTextView = itemView.findViewById(R.id.order_user_id);
            userNameTextView = itemView.findViewById(R.id.order_user_name);
            packageNameTextView = itemView.findViewById(R.id.order_package_name);
            totalAmountTextView = itemView.findViewById(R.id.order_total_amount);
            orderStatusTextView = itemView.findViewById(R.id.order_status);
            paymentStatusTextView = itemView.findViewById(R.id.order_payment_status);
            createdAtTextView = itemView.findViewById(R.id.order_created_at);
            editButton = itemView.findViewById(R.id.edit_button);
            deleteButton = itemView.findViewById(R.id.delete_button);
            viewButton = itemView.findViewById(R.id.view_button);
        }
    }
}
