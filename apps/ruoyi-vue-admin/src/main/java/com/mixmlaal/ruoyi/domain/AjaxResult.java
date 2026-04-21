package com.mixmlaal.ruoyi.domain;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class AjaxResult implements Serializable {
    private Integer code;
    private String msg;
    private Object data;
    private LocalDateTime time;

    public AjaxResult() {
        this.time = LocalDateTime.now();
    }

    public static AjaxResult success() {
        return success("操作成功");
    }

    public static AjaxResult success(Object data) {
        AjaxResult result = new AjaxResult();
        result.setCode(200);
        result.setMsg("操作成功");
        result.setData(data);
        return result;
    }

    public static AjaxResult error() {
        return error("操作失败");
    }

    public static AjaxResult error(String msg) {
        AjaxResult result = new AjaxResult();
        result.setCode(500);
        result.setMsg(msg);
        return result;
    }
}
