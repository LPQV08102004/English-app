package com.englishapp.backend.config;

import org.springframework.web.filter.CorsFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
public class CorsConfig {
    @Bean
    /*CorsFilter giống như một người gác cổng thông minh. Nó đọc danh sách "khách được phép vào" mà bạn đã
    soạn trong CorsConfiguration
    và quyết định xem có cho phép yêu cầu đó đi tiếp vào bên trong hệ thống hay không.*/
    public CorsFilter corsFilter(){
        CorsConfiguration configuration=new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));//sau này sửa lại thành đường dẫn cụ thể
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));//cho phép tất cả các header

        UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();//nguồn cấu hình CORS dựa trên URL
        source.registerCorsConfiguration("/**",configuration);//áp dụng cấu hình CORS cho tất cả các endpoint
        return new CorsFilter(source);

    }
}
