package com.mixmlaal.ruoyi.domain;

import lombok.Data;

@Data
public class RouterVo {
    private String path;
    private String component;
    private String name;
    private String redirect;
    private MenuMeta meta;
}
