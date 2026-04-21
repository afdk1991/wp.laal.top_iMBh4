package com.mixmlaal.ruoyi.domain;

import lombok.Data;

@Data
public class MenuMeta {
    private String title;
    private String icon;
    private String[] roles;
    private boolean keepAlive;
}
