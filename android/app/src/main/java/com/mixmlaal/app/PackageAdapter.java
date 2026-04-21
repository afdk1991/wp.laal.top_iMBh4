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

public class PackageAdapter extends RecyclerView.Adapter<PackageAdapter.PackageViewHolder> {

    private List<IntegratedServicesActivity.Package> packagesList;
    private Context context;

    public PackageAdapter(List<IntegratedServicesActivity.Package> packagesList, Context context) {
        this.packagesList = packagesList;
        this.context = context;
    }

    @Override
    public PackageViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_package, parent, false);
        return new PackageViewHolder(view);
    }

    @Override
    public void onBindViewHolder(PackageViewHolder holder, int position) {
        IntegratedServicesActivity.Package pkg = packagesList.get(position);
        holder.idTextView.setText(String.valueOf(pkg.id));
        holder.nameTextView.setText(pkg.name);
        holder.priceTextView.setText(String.valueOf(pkg.price) + "元");
        holder.servicesTextView.setText(pkg.services);
        holder.statusTextView.setText(pkg.status.equals("active") ? "启用" : "禁用");
        holder.statusTextView.setBackgroundColor(pkg.status.equals("active") ? 0xFFc6f6d5 : 0xFFfed7d7);
        holder.statusTextView.setTextColor(pkg.status.equals("active") ? 0xFF22543d : 0xFF742a2a);
        holder.createdAtTextView.setText(pkg.createdAt);

        holder.editButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "编辑套餐: " + pkg.name, Toast.LENGTH_SHORT).show();
            }
        });

        holder.deleteButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "删除套餐: " + pkg.name, Toast.LENGTH_SHORT).show();
            }
        });

        holder.viewButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(context, "查看套餐详情: " + pkg.name, Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public int getItemCount() {
        return packagesList.size();
    }

    public static class PackageViewHolder extends RecyclerView.ViewHolder {
        TextView idTextView;
        TextView nameTextView;
        TextView priceTextView;
        TextView servicesTextView;
        TextView statusTextView;
        TextView createdAtTextView;
        Button editButton;
        Button deleteButton;
        Button viewButton;

        public PackageViewHolder(View itemView) {
            super(itemView);
            idTextView = itemView.findViewById(R.id.package_id);
            nameTextView = itemView.findViewById(R.id.package_name);
            priceTextView = itemView.findViewById(R.id.package_price);
            servicesTextView = itemView.findViewById(R.id.package_services);
            statusTextView = itemView.findViewById(R.id.package_status);
            createdAtTextView = itemView.findViewById(R.id.package_created_at);
            editButton = itemView.findViewById(R.id.edit_button);
            deleteButton = itemView.findViewById(R.id.delete_button);
            viewButton = itemView.findViewById(R.id.view_button);
        }
    }
}
