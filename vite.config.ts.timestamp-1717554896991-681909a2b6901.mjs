// vite.config.ts
import dts from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-plugin-dts/dist/index.mjs";
import path from "path";
import react from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { getBabelOutputPlugin } from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/@rollup/plugin-babel/dist/es/index.js";
import cssInjectedByJsPlugin from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import eslint from "file:///C:/Users/bnri/Desktop/REL/react-pdf-quizmanager/node_modules/vite-plugin-eslint/dist/index.mjs";
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
    eslint({
      failOnError: false
    })
    // { // do not fail on serve (i.e. local development)
    //   ...eslint({
    //     failOnWarning: true,
    //     failOnError: true,
    //     lintOnStart:true,
    //     include:['src/**/*.js', 'src/**/*.vue', '/other/folder/project/src/*.vue']
    //   }),
    //   apply: 'serve',
    //   enforce: 'post'
    // }
    // eslintPlugin({
    //   cache: false,
    //   include: ['./src/**/*.ts', './src/**/*.tsx'],
    //   exclude: ['./node_modules/**', './dist/**'],
    // }),
    // stylelintPlugin({
    //   include: ['./src/**/*.css', './src/**/*.scss'],
    //   exclude: ['./node_modules/**', './dist/**'],
    // }),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxibnJpXFxcXERlc2t0b3BcXFxcUkVMXFxcXHJlYWN0LXBkZi1xdWl6bWFuYWdlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYm5yaVxcXFxEZXNrdG9wXFxcXFJFTFxcXFxyZWFjdC1wZGYtcXVpem1hbmFnZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2JucmkvRGVza3RvcC9SRUwvcmVhY3QtcGRmLXF1aXptYW5hZ2VyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBVc2VyQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XHJcbmltcG9ydCB7IGdldEJhYmVsT3V0cHV0UGx1Z2luIH0gZnJvbSAnQHJvbGx1cC9wbHVnaW4tYmFiZWwnXHJcbmltcG9ydCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tY3NzLWluamVjdGVkLWJ5LWpzJ1xyXG4vL2h0dHBzOi8vdmVsb2cuaW8vQHNlb255ZS05OC9ucG0tJUVCJTlEJUJDJUVDJTlEJUI0JUVCJUI4JThDJUVCJTlGJUFDJUVCJUE2JUFDLSVFQiVCMCVCMCVFRCU4RiVBQy1SZWFjdC0lRUMlQkIlQjQlRUQlOEYlQUMlRUIlODQlOEMlRUQlOEElQjgtJUVCJTlEJUJDJUVDJTlEJUI0JUVCJUI4JThDJUVCJTlGJUFDJUVCJUE2JUFDLSVFQiVCMCVCMCVFRCU4RiVBQyVFQyVBMCU4NC0lRUMlODQlQTQlRUMlQTAlOTVcclxuLy8gaW1wb3J0IGVzbGludFBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1lc2xpbnQnO1xyXG4vLyBpbXBvcnQgc3R5bGVsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLXN0eWxlbGludCc7XHJcbmltcG9ydCBlc2xpbnQgZnJvbSAndml0ZS1wbHVnaW4tZXNsaW50J1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGJhc2U6IFwiLi9cIixcclxuICBwbHVnaW5zOiBbXHJcbiAgICAvLyBkdHMoeyByb2xsdXBUeXBlczogdHJ1ZSB9KSxcclxuICAgIGR0cyh7IGluc2VydFR5cGVzRW50cnk6IHRydWUgfSksXHJcbiAgICBcclxuICAgIC8vIGR0cyh7XHJcbiAgICAvLyAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsIC8vIFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOCBcdUQwQzBcdUM3ODUgXHVDMEREXHVDMTMxXHJcbiAgICAvLyB9KSxcclxuICAgIHRzY29uZmlnUGF0aHMoKSwgLy8gXHVDODA4XHVCMzAwIFx1QUNCRFx1Qjg1QyBcdUMwRERcdUMxMzFcdUMyREMgXHVDMEFDXHVDNkE5XHVCNDFDXHVCMkU0LiBcclxuICAgIHJlYWN0KHsganN4UnVudGltZTogJ2NsYXNzaWMnIH0pLFxyXG4gICAgY3NzSW5qZWN0ZWRCeUpzUGx1Z2luKCksXHJcblxyXG4gICAgZXNsaW50KHtcclxuICAgICAgZmFpbE9uRXJyb3I6ZmFsc2VcclxuICAgIH0pLFxyXG4gICAgLy8geyAvLyBkbyBub3QgZmFpbCBvbiBzZXJ2ZSAoaS5lLiBsb2NhbCBkZXZlbG9wbWVudClcclxuICAgIC8vICAgLi4uZXNsaW50KHtcclxuICAgIC8vICAgICBmYWlsT25XYXJuaW5nOiB0cnVlLFxyXG4gICAgLy8gICAgIGZhaWxPbkVycm9yOiB0cnVlLFxyXG4gICAgLy8gICAgIGxpbnRPblN0YXJ0OnRydWUsXHJcbiAgICAvLyAgICAgaW5jbHVkZTpbJ3NyYy8qKi8qLmpzJywgJ3NyYy8qKi8qLnZ1ZScsICcvb3RoZXIvZm9sZGVyL3Byb2plY3Qvc3JjLyoudnVlJ11cclxuICAgIC8vICAgfSksXHJcbiAgICAvLyAgIGFwcGx5OiAnc2VydmUnLFxyXG4gICAgLy8gICBlbmZvcmNlOiAncG9zdCdcclxuICAgIC8vIH1cclxuXHJcblxyXG5cclxuICAgIC8vIGVzbGludFBsdWdpbih7XHJcbiAgICAvLyAgIGNhY2hlOiBmYWxzZSxcclxuICAgIC8vICAgaW5jbHVkZTogWycuL3NyYy8qKi8qLnRzJywgJy4vc3JjLyoqLyoudHN4J10sXHJcbiAgICAvLyAgIGV4Y2x1ZGU6IFsnLi9ub2RlX21vZHVsZXMvKionLCAnLi9kaXN0LyoqJ10sXHJcbiAgICAvLyB9KSxcclxuICAgIC8vIHN0eWxlbGludFBsdWdpbih7XHJcbiAgICAvLyAgIGluY2x1ZGU6IFsnLi9zcmMvKiovKi5jc3MnLCAnLi9zcmMvKiovKi5zY3NzJ10sXHJcbiAgICAvLyAgIGV4Y2x1ZGU6IFsnLi9ub2RlX21vZHVsZXMvKionLCAnLi9kaXN0LyoqJ10sXHJcbiAgICAvLyB9KSxcclxuICBdLFxyXG4gIC8vIHBsdWdpbnM6IFtkdHMoeyByb2xsdXBUeXBlczogdHJ1ZSB9KSwgcmVhY3QoKSwgYmFiZWwoeyBleHRlbnNpb25zOiBbJy5qcycsICcuanN4JywgJy50cycsICcudHN4J10gfSldLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICBwb3J0OiAzMDAwXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgbGliOiB7XHJcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9saWIvaW5kZXgudHNcIiksIC8vXHVCNzdDXHVDNzc0XHVCRTBDXHVCN0VDXHVCOUFDIFx1QzlDNFx1Qzc4NVx1QzgxMCwgXHVDODFDXHVBQ0Y1XHVENTU4XHVBQ0UwXHVDNzkwXHVENTU4XHVCMjk0IFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOFx1Qjk3QyBcdUJBQThcdUI0NTAgZXhwb3J0XHVENTU4XHVCMjk0IFx1QkQ4MFx1QkQ4NFxyXG4gICAgICBuYW1lOiBcInJlYWN0LWdwdGFibGVcIixcclxuICAgICAgLy8gZm9ybWF0czogW1wiZXNcIiwgXCJjanNcIiwgXCJ1bWRcIiwgXCJpaWZlXCJdLFxyXG4gICAgICBmb3JtYXRzOiBbXCJlc1wiLCBcImNqc1wiXSxcclxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdH0uanNgLFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sIC8vXHVCNzdDXHVDNzc0XHVCRTBDXHVCN0VDXHVCOUFDXHVDNUQwIFx1RDNFQ1x1RDU2OFx1RDU1OFx1QzlDMCBcdUM1NEFcdUM3NDQgZGVwZW5kZW5jeSBcdUJBODVcdUMyRENcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgZ2V0QmFiZWxPdXRwdXRQbHVnaW4oe1xyXG4gICAgICAgICAgICBhbGxvd0FsbEZvcm1hdHM6IHRydWUsXHJcbiAgICAgICAgICAgIHByZXNldHM6IFtcclxuICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAnQGJhYmVsL3ByZXNldC1lbnYnLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICB0YXJnZXRzOiAnPiAwLjI1JSwgbm90IGRlYWQsIElFIDExJyxcclxuICAgICAgICAgICAgICAgICAgdXNlQnVpbHRJbnM6IGZhbHNlLCAvLyBEZWZhdWx0XHVGRjFBZmFsc2VcclxuICAgICAgICAgICAgICAgICAgLy8gLy8gaHR0cHM6Ly9iYWJlbGpzLmlvL2RvY3MvZW4vYmFiZWwtcHJlc2V0LWVudiNtb2R1bGVzXHJcbiAgICAgICAgICAgICAgICAgIG1vZHVsZXM6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSksXHJcblxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgcmVhY3Q6IFwiUmVhY3RcIixcclxuICAgICAgICAgIFwicmVhY3QtZG9tXCI6IFwiUmVhY3RET01cIixcclxuICAgICAgICB9LCAvL1x1Qjc3Q1x1Qzc3NFx1QkUwQ1x1QjdFQ1x1QjlBQyBcdUM2NzhcdUJEODBcdUM1RDAgXHVDODc0XHVDN0FDXHVENTU4XHVCMjk0IGRlcGVuZGVuY3lcdUI5N0MgXHVDNzA0XHVENTc0IFx1QkM4OFx1QjRFNFx1QjlDMSBcdUMyREMgXHVDMEFDXHVDNkE5XHVCNDIwIFx1QzgwNFx1QzVFRCBcdUJDQzBcdUMyMTggXHVCQTg1XHVDMkRDXHJcbiAgICAgICAgYmFubmVyOiAnXCJ1c2UgY2xpZW50XCI7JywgLy9cdUJDODhcdUI0RTQgXHVDNTVFXHVDNUQwIFx1QkIzOFx1Qzc5MFx1QzVGNFx1Qzc0NCBcdUNEOTRcdUFDMDBcdUQ1NjgsIFwidXNlIGNsaWVudFwiO1x1Qjk3QyBcdUNEOTRcdUFDMDBcdUQ1NzQgXHVDRUY0XHVEM0VDXHVCMTBDXHVEMkI4XHVDNzU4IFx1QkFBOFx1QjRFMCBcdUMwQUNcdUM2QTlcdUM3NDQgXHVEMDc0XHVCNzdDXHVDNzc0XHVDNUI4XHVEMkI4IFx1Q0VGNFx1RDNFQ1x1QjEwQ1x1RDJCOFx1Qjg1QyBcdUJDRjRcdUM3QTUgKFx1QjlBQ1x1QzU2MVx1RDJCOCBcdUMxMUNcdUJDODQgXHVDRUY0XHVEM0VDXHVCMTBDXHVEMkI4XHVBQzAwIFx1QjA5OFx1QzYyOCBcdUMyRENcdUM4MTBcdUM1RDBcdUMxMUMgXHVCQTg1XHVDMkRDXHVENTU4XHVCMjk0XHVBQzhDIFx1QjM1NCBcdUM1NDhcdUM4MDRcdUQ1NjAgXHVBQzgzIFx1QUMxOVx1QjJFNFx1QUNFMCBcdUQzMTBcdUIyRTgpXHJcbiAgICAgICAgaW50ZXJvcDogJ2F1dG8nLCAvL1x1QzY3OFx1QkQ4MCBcdUM3NThcdUM4NzRcdUMxMzFcdUFDRkNcdUM3NTggXHVCQUE4XHVCNEM4IFx1QUMwNCBcdUMwQzFcdUQ2MzggXHVDNzkxXHVDNkE5IFx1QkMyOVx1QzJERCBcdUMxMjRcdUM4MTUgKFx1QUUzMFx1QkNGOCBcdUJBQThcdUI0RENcdUM1RDBcdUMxMUMgTm9kZS5qcyBcdUIzRDlcdUM3OTEgXHVCQzI5XHVDMkREXHVDNzQ0IFx1QjUzMFx1Qjk3NFx1QkE3MCwgVHlwZVNjcmlwdFx1Qzc1OCBlc01vZHVsZUludGVyb3AgXHVCM0Q5XHVDNzkxXHVBQ0ZDIFx1QjJFNFx1Qjk3NFx1QkJDMFx1Qjg1QyBhdXRvXHVCODVDIFx1QzEyNFx1QzgxNVx1RDU1OFx1QzVFQyBFU1x1QkFBOFx1QjRDOFx1QUNGQyBDb21tb25KU1x1QkFBOFx1QjRDOCBcdUFDMDRcdUM3NTggXHVDMEMxXHVENjM4IFx1QzZCNFx1QzZBOVx1QzEzMSBcdUJCMzhcdUM4MUNcdUI5N0MgXHVDOTA0XHVDNzg0KVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xyXG4gICAgICBlc21FeHRlcm5hbHM6IFsncmVhY3QnXSxcclxuICAgIH0sXHJcbiAgfSxcclxufSBzYXRpc2ZpZXMgVXNlckNvbmZpZyk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlUsT0FBTyxTQUFTO0FBQzNWLE9BQU8sVUFBVTtBQUNqQixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBZ0M7QUFDekMsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyw0QkFBNEI7QUFDckMsT0FBTywyQkFBMkI7QUFJbEMsT0FBTyxZQUFZO0FBVm5CLElBQU0sbUNBQW1DO0FBV3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQTtBQUFBLElBRVAsSUFBSSxFQUFFLGtCQUFrQixLQUFLLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUs5QixjQUFjO0FBQUE7QUFBQSxJQUNkLE1BQU0sRUFBRSxZQUFZLFVBQVUsQ0FBQztBQUFBLElBQy9CLHNCQUFzQjtBQUFBLElBRXRCLE9BQU87QUFBQSxNQUNMLGFBQVk7QUFBQSxJQUNkLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBdUJIO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsTUFDSCxPQUFPLEtBQUssUUFBUSxrQ0FBVyxrQkFBa0I7QUFBQTtBQUFBLE1BQ2pELE1BQU07QUFBQTtBQUFBLE1BRU4sU0FBUyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCLFVBQVUsQ0FBQyxXQUFXLFNBQVMsTUFBTTtBQUFBLElBQ3ZDO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsU0FBUyxXQUFXO0FBQUE7QUFBQSxNQUMvQixRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxxQkFBcUI7QUFBQSxZQUNuQixpQkFBaUI7QUFBQSxZQUNqQixTQUFTO0FBQUEsY0FDUDtBQUFBLGdCQUNFO0FBQUEsZ0JBQ0E7QUFBQSxrQkFDRSxTQUFTO0FBQUEsa0JBQ1QsYUFBYTtBQUFBO0FBQUE7QUFBQSxrQkFFYixTQUFTO0FBQUEsZ0JBQ1g7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBRUg7QUFBQSxRQUNBLFNBQVM7QUFBQSxVQUNQLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxRQUNmO0FBQUE7QUFBQSxRQUNBLFFBQVE7QUFBQTtBQUFBLFFBQ1IsU0FBUztBQUFBO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLE1BQ2YsY0FBYyxDQUFDLE9BQU87QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFDRixDQUFzQjsiLAogICJuYW1lcyI6IFtdCn0K
