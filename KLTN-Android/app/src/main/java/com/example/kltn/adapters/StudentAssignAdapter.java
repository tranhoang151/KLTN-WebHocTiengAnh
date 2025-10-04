package com.example.kltn.adapters;

import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.CheckBox;
import android.widget.Filter;
import android.widget.Filterable;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class StudentAssignAdapter extends BaseAdapter implements Filterable {
    private Context context;
    private List<String> allStudentNames;
    private List<String> allStudentIds;
    private List<String> filteredNames;
    private List<String> filteredIds;
    private Set<String> selectedIds = new HashSet<>();

    public StudentAssignAdapter(Context context, List<String> studentNames, List<String> studentIds, List<String> preselectedIds) {
        this.context = context;
        this.allStudentNames = new ArrayList<>(studentNames);
        this.allStudentIds = new ArrayList<>(studentIds);
        this.filteredNames = new ArrayList<>(studentNames);
        this.filteredIds = new ArrayList<>(studentIds);
        if (preselectedIds != null) selectedIds.addAll(preselectedIds);
    }

    @Override
    public int getCount() {
        return filteredNames.size();
    }

    @Override
    public Object getItem(int position) {
        return filteredNames.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;
        if (convertView == null) {
            convertView = LayoutInflater.from(context).inflate(android.R.layout.simple_list_item_multiple_choice, parent, false);
            holder = new ViewHolder();
            holder.textView = convertView.findViewById(android.R.id.text1);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }
        holder.textView.setText(filteredNames.get(position));
        final String studentId = filteredIds.get(position);
        // Set checked state
        ((android.widget.CheckedTextView) holder.textView).setChecked(selectedIds.contains(studentId));

        convertView.setOnClickListener(v -> {
            if (selectedIds.contains(studentId)) {
                selectedIds.remove(studentId);
                ((android.widget.CheckedTextView) holder.textView).setChecked(false);
            } else {
                selectedIds.add(studentId);
                ((android.widget.CheckedTextView) holder.textView).setChecked(true);
            }
        });
        return convertView;
    }

    public Set<String> getSelectedIds() {
        return selectedIds;
    }

    @Override
    public Filter getFilter() {
        return new Filter() {
            @Override
            protected FilterResults performFiltering(CharSequence constraint) {
                FilterResults results = new FilterResults();
                if (TextUtils.isEmpty(constraint)) {
                    results.values = new ArrayList<>(allStudentNames);
                    results.count = allStudentNames.size();
                } else {
                    List<String> filteredList = new ArrayList<>();
                    for (String name : allStudentNames) {
                        if (name.toLowerCase().contains(constraint.toString().toLowerCase())) {
                            filteredList.add(name);
                        }
                    }
                    results.values = filteredList;
                    results.count = filteredList.size();
                }
                return results;
            }

            @Override
            protected void publishResults(CharSequence constraint, FilterResults results) {
                filteredNames.clear();
                filteredIds.clear();
                List<String> filteredList = (List<String>) results.values;
                for (String name : filteredList) {
                    int idx = allStudentNames.indexOf(name);
                    if (idx != -1) {
                        filteredNames.add(name);
                        filteredIds.add(allStudentIds.get(idx));
                    }
                }
                notifyDataSetChanged();
            }
        };
    }

    static class ViewHolder {
        TextView textView;
    }
}
