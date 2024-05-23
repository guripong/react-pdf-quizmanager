// vite.config.ts
import dts from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-plugin-dts/dist/index.mjs";
import path from "path";
import react from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { getBabelOutputPlugin } from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/@rollup/plugin-babel/dist/es/index.js";
import cssInjectedByJsPlugin from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import eslintPlugin from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-plugin-eslint/dist/index.mjs";
import stylelintPlugin from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-plugin-stylelint/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\bnri\\Desktop\\REL\\react-pdf-quizmanager";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    // dts({ rollupTypes: true }),
    dts({ insertTypesEntry: true }),
    // dts({
    //   insertTypesEntry: true, // 컴포넌트 타입 생성
    // }),
    tsconfigPaths(),
    // 절대 경로 생성시 사용된다. 
    react({ jsxRuntime: "classic" }),
    cssInjectedByJsPlugin(),
    eslintPlugin({
      cache: false,
      include: ["./src/**/*.ts", "./src/**/*.tsx"],
      exclude: ["./node_modules/**", "./dist/**"]
    }),
    stylelintPlugin({
      include: ["./src/**/*.css", "./src/**/*.scss"],
      exclude: ["./node_modules/**", "./dist/**"]
    })
  ],
  // plugins: [dts({ rollupTypes: true }), react(), babel({ extensions: ['.js', '.jsx', '.ts', '.tsx'] })],
  server: {
    host: "0.0.0.0",
    port: 3e3
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/lib/index.ts"),
      //라이브러리 진입점, 제공하고자하는 컴포넌트를 모두 export하는 부분
      name: "react-gptable",
      // formats: ["es", "cjs", "umd", "iife"],
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      //라이브러리에 포함하지 않을 dependency 명시
      output: {
        plugins: [
          getBabelOutputPlugin({
            allowAllFormats: true,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: "> 0.25%, not dead, IE 11",
                  useBuiltIns: false,
                  // Default：false
                  // // https://babeljs.io/docs/en/babel-preset-env#modules
                  modules: false
                }
              ]
            ]
          })
        ],
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        },
        //라이브러리 외부에 존재하는 dependency를 위해 번들링 시 사용될 전역 변수 명시
        banner: '"use client";',
        //번들 앞에 문자열을 추가함, "use client";를 추가해 컴포넌트의 모든 사용을 클라이언트 컴포넌트로 보장 (리액트 서버 컴포넌트가 나온 시점에서 명시하는게 더 안전할 것 같다고 판단)
        interop: "auto"
        //외부 의존성과의 모듈 간 상호 작용 방식 설정 (기본 모드에서 Node.js 동작 방식을 따르며, TypeScript의 esModuleInterop 동작과 다르므로 auto로 설정하여 ES모듈과 CommonJS모듈 간의 상호 운용성 문제를 줄임)
      }
    },
    commonjsOptions: {
      esmExternals: ["react"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxibnJpXFxcXERlc2t0b3BcXFxcUkVMXFxcXHJlYWN0LXBkZi1xdWl6bWFuYWdlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYm5yaVxcXFxEZXNrdG9wXFxcXFJFTFxcXFxyZWFjdC1wZGYtcXVpem1hbmFnZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2JucmkvRGVza3RvcC9SRUwvcmVhY3QtcGRmLXF1aXptYW5hZ2VyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBVc2VyQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XHJcbmltcG9ydCB7IGdldEJhYmVsT3V0cHV0UGx1Z2luIH0gZnJvbSAnQHJvbGx1cC9wbHVnaW4tYmFiZWwnXHJcbmltcG9ydCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tY3NzLWluamVjdGVkLWJ5LWpzJ1xyXG4vL2h0dHBzOi8vdmVsb2cuaW8vQHNlb255ZS05OC9ucG0tJUVCJTlEJUJDJUVDJTlEJUI0JUVCJUI4JThDJUVCJTlGJUFDJUVCJUE2JUFDLSVFQiVCMCVCMCVFRCU4RiVBQy1SZWFjdC0lRUMlQkIlQjQlRUQlOEYlQUMlRUIlODQlOEMlRUQlOEElQjgtJUVCJTlEJUJDJUVDJTlEJUI0JUVCJUI4JThDJUVCJTlGJUFDJUVCJUE2JUFDLSVFQiVCMCVCMCVFRCU4RiVBQyVFQyVBMCU4NC0lRUMlODQlQTQlRUMlQTAlOTVcclxuaW1wb3J0IGVzbGludFBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1lc2xpbnQnO1xyXG5pbXBvcnQgc3R5bGVsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLXN0eWxlbGludCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGJhc2U6IFwiLi9cIixcclxuICBwbHVnaW5zOiBbXHJcbiAgICAvLyBkdHMoeyByb2xsdXBUeXBlczogdHJ1ZSB9KSxcclxuICAgIGR0cyh7IGluc2VydFR5cGVzRW50cnk6IHRydWUgfSksXHJcbiAgICBcclxuICAgIC8vIGR0cyh7XHJcbiAgICAvLyAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsIC8vIFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOCBcdUQwQzBcdUM3ODUgXHVDMEREXHVDMTMxXHJcbiAgICAvLyB9KSxcclxuICAgIHRzY29uZmlnUGF0aHMoKSwgLy8gXHVDODA4XHVCMzAwIFx1QUNCRFx1Qjg1QyBcdUMwRERcdUMxMzFcdUMyREMgXHVDMEFDXHVDNkE5XHVCNDFDXHVCMkU0LiBcclxuICAgIHJlYWN0KHsganN4UnVudGltZTogJ2NsYXNzaWMnIH0pLFxyXG4gICAgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luKCksXHJcbiAgICBlc2xpbnRQbHVnaW4oe1xyXG4gICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgIGluY2x1ZGU6IFsnLi9zcmMvKiovKi50cycsICcuL3NyYy8qKi8qLnRzeCddLFxyXG4gICAgICBleGNsdWRlOiBbJy4vbm9kZV9tb2R1bGVzLyoqJywgJy4vZGlzdC8qKiddLFxyXG4gICAgfSksXHJcbiAgICBzdHlsZWxpbnRQbHVnaW4oe1xyXG4gICAgICBpbmNsdWRlOiBbJy4vc3JjLyoqLyouY3NzJywgJy4vc3JjLyoqLyouc2NzcyddLFxyXG4gICAgICBleGNsdWRlOiBbJy4vbm9kZV9tb2R1bGVzLyoqJywgJy4vZGlzdC8qKiddLFxyXG4gICAgfSksXHJcbiAgXSxcclxuICAvLyBwbHVnaW5zOiBbZHRzKHsgcm9sbHVwVHlwZXM6IHRydWUgfSksIHJlYWN0KCksIGJhYmVsKHsgZXh0ZW5zaW9uczogWycuanMnLCAnLmpzeCcsICcudHMnLCAnLnRzeCddIH0pXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxyXG4gICAgcG9ydDogMzAwMFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuICAgIGxpYjoge1xyXG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvbGliL2luZGV4LnRzXCIpLCAvL1x1Qjc3Q1x1Qzc3NFx1QkUwQ1x1QjdFQ1x1QjlBQyBcdUM5QzRcdUM3ODVcdUM4MTAsIFx1QzgxQ1x1QUNGNVx1RDU1OFx1QUNFMFx1Qzc5MFx1RDU1OFx1QjI5NCBcdUNFRjRcdUQzRUNcdUIxMENcdUQyQjhcdUI5N0MgXHVCQUE4XHVCNDUwIGV4cG9ydFx1RDU1OFx1QjI5NCBcdUJEODBcdUJEODRcclxuICAgICAgbmFtZTogXCJyZWFjdC1ncHRhYmxlXCIsXHJcbiAgICAgIC8vIGZvcm1hdHM6IFtcImVzXCIsIFwiY2pzXCIsIFwidW1kXCIsIFwiaWlmZVwiXSxcclxuICAgICAgZm9ybWF0czogW1wiZXNcIiwgXCJjanNcIl0sXHJcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXR9LmpzYCxcclxuICAgIH0sXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLCAvL1x1Qjc3Q1x1Qzc3NFx1QkUwQ1x1QjdFQ1x1QjlBQ1x1QzVEMCBcdUQzRUNcdUQ1NjhcdUQ1NThcdUM5QzAgXHVDNTRBXHVDNzQ0IGRlcGVuZGVuY3kgXHVCQTg1XHVDMkRDXHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgIGdldEJhYmVsT3V0cHV0UGx1Z2luKHtcclxuICAgICAgICAgICAgYWxsb3dBbGxGb3JtYXRzOiB0cnVlLFxyXG4gICAgICAgICAgICBwcmVzZXRzOiBbXHJcbiAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgJ0BiYWJlbC9wcmVzZXQtZW52JyxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgdGFyZ2V0czogJz4gMC4yNSUsIG5vdCBkZWFkLCBJRSAxMScsXHJcbiAgICAgICAgICAgICAgICAgIHVzZUJ1aWx0SW5zOiBmYWxzZSwgLy8gRGVmYXVsdFx1RkYxQWZhbHNlXHJcbiAgICAgICAgICAgICAgICAgIC8vIC8vIGh0dHBzOi8vYmFiZWxqcy5pby9kb2NzL2VuL2JhYmVsLXByZXNldC1lbnYjbW9kdWxlc1xyXG4gICAgICAgICAgICAgICAgICBtb2R1bGVzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0pLFxyXG5cclxuICAgICAgICBdLFxyXG4gICAgICAgIGdsb2JhbHM6IHtcclxuICAgICAgICAgIHJlYWN0OiBcIlJlYWN0XCIsXHJcbiAgICAgICAgICBcInJlYWN0LWRvbVwiOiBcIlJlYWN0RE9NXCIsXHJcbiAgICAgICAgfSwgLy9cdUI3N0NcdUM3NzRcdUJFMENcdUI3RUNcdUI5QUMgXHVDNjc4XHVCRDgwXHVDNUQwIFx1Qzg3NFx1QzdBQ1x1RDU1OFx1QjI5NCBkZXBlbmRlbmN5XHVCOTdDIFx1QzcwNFx1RDU3NCBcdUJDODhcdUI0RTRcdUI5QzEgXHVDMkRDIFx1QzBBQ1x1QzZBOVx1QjQyMCBcdUM4MDRcdUM1RUQgXHVCQ0MwXHVDMjE4IFx1QkE4NVx1QzJEQ1xyXG4gICAgICAgIGJhbm5lcjogJ1widXNlIGNsaWVudFwiOycsIC8vXHVCQzg4XHVCNEU0IFx1QzU1RVx1QzVEMCBcdUJCMzhcdUM3OTBcdUM1RjRcdUM3NDQgXHVDRDk0XHVBQzAwXHVENTY4LCBcInVzZSBjbGllbnRcIjtcdUI5N0MgXHVDRDk0XHVBQzAwXHVENTc0IFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOFx1Qzc1OCBcdUJBQThcdUI0RTAgXHVDMEFDXHVDNkE5XHVDNzQ0IFx1RDA3NFx1Qjc3Q1x1Qzc3NFx1QzVCOFx1RDJCOCBcdUNFRjRcdUQzRUNcdUIxMENcdUQyQjhcdUI4NUMgXHVCQ0Y0XHVDN0E1IChcdUI5QUNcdUM1NjFcdUQyQjggXHVDMTFDXHVCQzg0IFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOFx1QUMwMCBcdUIwOThcdUM2MjggXHVDMkRDXHVDODEwXHVDNUQwXHVDMTFDIFx1QkE4NVx1QzJEQ1x1RDU1OFx1QjI5NFx1QUM4QyBcdUIzNTQgXHVDNTQ4XHVDODA0XHVENTYwIFx1QUM4MyBcdUFDMTlcdUIyRTRcdUFDRTAgXHVEMzEwXHVCMkU4KVxyXG4gICAgICAgIGludGVyb3A6ICdhdXRvJywgLy9cdUM2NzhcdUJEODAgXHVDNzU4XHVDODc0XHVDMTMxXHVBQ0ZDXHVDNzU4IFx1QkFBOFx1QjRDOCBcdUFDMDQgXHVDMEMxXHVENjM4IFx1Qzc5MVx1QzZBOSBcdUJDMjlcdUMyREQgXHVDMTI0XHVDODE1IChcdUFFMzBcdUJDRjggXHVCQUE4XHVCNERDXHVDNUQwXHVDMTFDIE5vZGUuanMgXHVCM0Q5XHVDNzkxIFx1QkMyOVx1QzJERFx1Qzc0NCBcdUI1MzBcdUI5NzRcdUJBNzAsIFR5cGVTY3JpcHRcdUM3NTggZXNNb2R1bGVJbnRlcm9wIFx1QjNEOVx1Qzc5MVx1QUNGQyBcdUIyRTRcdUI5NzRcdUJCQzBcdUI4NUMgYXV0b1x1Qjg1QyBcdUMxMjRcdUM4MTVcdUQ1NThcdUM1RUMgRVNcdUJBQThcdUI0QzhcdUFDRkMgQ29tbW9uSlNcdUJBQThcdUI0QzggXHVBQzA0XHVDNzU4IFx1QzBDMVx1RDYzOCBcdUM2QjRcdUM2QTlcdUMxMzEgXHVCQjM4XHVDODFDXHVCOTdDIFx1QzkwNFx1Qzc4NClcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBjb21tb25qc09wdGlvbnM6IHtcclxuICAgICAgZXNtRXh0ZXJuYWxzOiBbJ3JlYWN0J10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0gc2F0aXNmaWVzIFVzZXJDb25maWcpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJVLE9BQU8sU0FBUztBQUMzVixPQUFPLFVBQVU7QUFDakIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQWdDO0FBQ3pDLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsNEJBQTRCO0FBQ3JDLE9BQU8sMkJBQTJCO0FBRWxDLE9BQU8sa0JBQWtCO0FBQ3pCLE9BQU8scUJBQXFCO0FBVDVCLElBQU0sbUNBQW1DO0FBV3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQTtBQUFBLElBRVAsSUFBSSxFQUFFLGtCQUFrQixLQUFLLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUs5QixjQUFjO0FBQUE7QUFBQSxJQUNkLE1BQU0sRUFBRSxZQUFZLFVBQVUsQ0FBQztBQUFBLElBQy9CLHNCQUFzQjtBQUFBLElBQ3RCLGFBQWE7QUFBQSxNQUNYLE9BQU87QUFBQSxNQUNQLFNBQVMsQ0FBQyxpQkFBaUIsZ0JBQWdCO0FBQUEsTUFDM0MsU0FBUyxDQUFDLHFCQUFxQixXQUFXO0FBQUEsSUFDNUMsQ0FBQztBQUFBLElBQ0QsZ0JBQWdCO0FBQUEsTUFDZCxTQUFTLENBQUMsa0JBQWtCLGlCQUFpQjtBQUFBLE1BQzdDLFNBQVMsQ0FBQyxxQkFBcUIsV0FBVztBQUFBLElBQzVDLENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsTUFDSCxPQUFPLEtBQUssUUFBUSxrQ0FBVyxrQkFBa0I7QUFBQTtBQUFBLE1BQ2pELE1BQU07QUFBQTtBQUFBLE1BRU4sU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCLFVBQVUsQ0FBQyxXQUFXLFNBQVMsTUFBTTtBQUFBLElBQ3ZDO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsU0FBUyxXQUFXO0FBQUE7QUFBQSxNQUMvQixRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxxQkFBcUI7QUFBQSxZQUNuQixpQkFBaUI7QUFBQSxZQUNqQixTQUFTO0FBQUEsY0FDUDtBQUFBLGdCQUNFO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxTQUFTO0FBQUEsa0JBQ1QsYUFBYTtBQUFBO0FBQUE7QUFBQSxrQkFFYixTQUFTO0FBQUEsZ0JBQ1g7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBRUg7QUFBQSxRQUNBLFNBQVM7QUFBQSxVQUNQLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxRQUNmO0FBQUE7QUFBQSxRQUNBLFFBQVE7QUFBQTtBQUFBLFFBQ1IsU0FBUztBQUFBO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLE1BQ2YsY0FBYyxDQUFDLE9BQU87QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFDRixDQUFzQjsiLAogICJuYW1lcyI6IFtdCn0K
