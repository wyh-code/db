import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',
    
    // 测试文件匹配模式
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'test_data'],
    
    // 全局 API（无需导入 describe、test、expect）
    globals: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'node_modules',
        'dist'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    
    // 测试超时时间（毫秒）
    testTimeout: 10000,
    
    // 监听模式下排除的文件
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/test_data/**'],
    
    // 并发运行测试
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    },
    
    // 测试隔离
    isolate: true,
    
    // 显示详细输出
    reporters: ['verbose'],
    
    // 失败时显示堆栈
    printConsoleTrace: true
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});