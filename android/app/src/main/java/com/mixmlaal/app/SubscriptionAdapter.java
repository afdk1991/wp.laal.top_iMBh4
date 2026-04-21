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

public class SubscriptionAdapter extends RecyclerView.Adapter<SubscriptionAdapter.SubscriptionViewHolder> {

    private List<IntegratedServicesActivity.Subscription> subscriptionsList;
    private Context context;

    public SubscriptionAdapter(List<IntegratedServicesActivity.Subscription> subscriptionsList, Context context) {
        this.subscriptionsList = subscriptionsList;
        this.context = context;
    }

    @Override
    public SubscriptionViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_subscription, parent, false);
        return new SubscriptionViewHolder(view);
    }

    @Override
    public void onBindViewHolder(SubscriptionViewHolder holder, int position) {
        IntegratedServicesActivity.Subscription subscription = subscriptionsList.get(position);
        holder.idTextView.setText(String.valueOf(subscription.id));
        holder.userIdTextView.setText(String.valueOf(subscription.userId));
        holder.userNameTextView.setText(subscription.userName);
        holder.packageNameTextView.setText(subscription.packageName);
        holder.subscribeTimeTextView.setText(subscription.subscribeTime);
        holder.expireTimeTextView.setText(subscription.expireTime);
        holder.statusTextView.setText(subscription.status.equals("active") ? "活跃" : "已过期");
        holder.statusTextView.setBackgroundColor(subscription.status.equals("active") ? 0xFFc6f6d5 : 0xFFfed7d7);
        holder.statusTextView.setTextColor(subscription.status.equals("active") ? 0xFF22543d : 0xFF742a2a);

        holder.editButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "编辑订阅: " + subscription.userName, Toast.LENGTH_SHORT).show();
            }
        });

        holder.deleteButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "删除订阅: " + subscription.userName, Toast.LENGTH_SHORT).show();
            }
        });

        holder.viewButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "查看订阅详情: " + subscription.userName, Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public int getItemCount() {
        return subscriptionsList.size();
    }

    public static class SubscriptionViewHolder extends RecyclerView.ViewHolder {
        TextView idTextView;
        TextView userIdTextView;
        TextView userNameTextView;
        TextView packageNameTextView;
        TextView subscribeTimeTextView;
        TextView expireTimeTextView;
        TextView statusTextView;
        Button editButton;
        Button deleteButton;
        Button viewButton;

        public SubscriptionViewHolder(View itemView) {
            super(itemView);
            idTextView = itemView.findViewById(R.id.subscription_id);
            userIdTextView = itemView.findViewById(R.id.subscription_user_id);
            userNameTextView = itemView.findViewById(R.id.subscription_user_name);
            packageNameTextView = itemView.findViewById(R.id.subscription_package_name);
            subscribeTimeTextView = itemView.findViewById(R.id.subscription_subscribe_time);
            expireTimeTextView = itemView.findViewById(R.id.subscription_expire_time);
            statusTextView = itemView.findViewById(R.id.subscription_status);
            editButton = itemView.findViewById(R.id.edit_button);
            deleteButton = itemView.findViewById(R.id.delete_button);
            viewButton = itemView.findViewById(R.id.view_button);
        }
    }
}
