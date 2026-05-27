<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in kpiList" :key="index">
        <el-card shadow="hover" class="kpi-card" v-loading="loading">
          <div class="kpi-header">
            <span class="kpi-title">{{ item.title }}</span>
            <el-tag :type="item.tagType" size="small">{{ item.tag }}</el-tag>
          </div>
          <div class="kpi-value">{{ item.value }}</div>
          <div class="kpi-footer" v-if="item.trend !== null">
            <span :class="item.trend >= 0 ? 'up' : 'down'">
              {{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}%
            </span>
            <span class="text-grey"> 较昨日同期</span>
          </div>
          <div class="kpi-footer" v-else>
            <span class="text-grey">{{ item.desc }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card header="近七日真实营收趋势" shadow="never" v-loading="loading">
          <div class="chart-box">
            <div class="mock-chart">
              <div v-for="(day, index) in weeklyData" :key="index" class="bar-wrapper">
                <el-tooltip :content="'¥ ' + day.sales" placement="top">
                  <div class="bar" :style="{ height: getBarHeight(day.sales) + '%' }"></div>
                </el-tooltip>
              </div>
            </div>
            <div class="chart-label">
              <span v-for="(day, index) in weeklyData" :key="index">{{ day.date }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card header="🔥 紧急待处理事项" shadow="never" v-loading="loading">
          <div class="todo-list">
            <div class="todo-item" v-if="todos.pending_ship > 0">
              <el-checkbox checked disabled>有 {{ todos.pending_ship }} 笔订单已付款，等待发货</el-checkbox>
              <el-button type="primary" link size="small" @click="$router.push({ path: '/orders', query: { topTab: 'orderTable', status: 'paid' } })">去处理</el-button>
            </div>
            
            <div class="todo-item" v-if="todos.pending_after_sales > 0">
              <el-checkbox checked disabled>有 {{ todos.pending_after_sales }} 个售后申请等待审核</el-checkbox>
              <el-button type="danger" link size="small" @click="$router.push({ path: '/orders', query: { topTab: 'afterSales' } })">去审核</el-button>
            </div>
          
            <div class="todo-item" v-if="kpiList[3] && kpiList[3].raw_value > 0">
              <el-checkbox checked disabled>有 {{ kpiList[3].raw_value }} 件商品库存不足 10 件</el-checkbox>
              <el-button type="warning" link size="small" @click="$router.push('/products')">去补货</el-button>
            </div>
          
            <el-empty v-if="todos.pending_ship === 0 && todos.pending_after_sales === 0 && (!kpiList[3] || kpiList[3].raw_value === 0)" description="太棒了！当前没有任何积压任务" :image-size="80"></el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'

const router = useRouter()
const loading = ref(false)

const kpiList = ref([])
const weeklyData = ref([])
const todos = ref({ pending_ship: 0, pending_after_sales: 0 })

// 获取最高销售额，用来计算柱状图的百分比高度
const getBarHeight = (sales) => {
  if (weeklyData.value.length === 0) return 0;
  const maxSales = Math.max(...weeklyData.value.map(d => d.sales));
  if (maxSales === 0) return 2; // 如果都没销量，给个 2% 基础高度
  return (sales / maxSales) * 100;
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/dashboard/stats/')
    if (res.data.code === 200) {
      const data = res.data.data
      const kpis = data.kpis

      // 组装 KPI 数据
      kpiList.value = [
        { title: '今日实际营收', value: `¥ ${kpis.today_sales.toFixed(2)}`, tag: '核心', tagType: 'danger', trend: kpis.sales_trend },
        { title: '今日新增订单', value: `${kpis.today_orders} 单`, tag: '交易', tagType: 'success', trend: kpis.order_trend },
        { title: '平台总用户数', value: `${kpis.total_users} 人`, tag: '生态', tagType: 'warning', trend: null, desc: '持续积累私域流量' },
        { title: '库存预警商品', value: `${kpis.low_stock_count} 件`, tag: '需关注', tagType: 'info', trend: null, desc: '库存少于 10 件', raw_value: kpis.low_stock_count }
      ]

      weeklyData.value = data.weekly_data
      todos.value = data.todos
    }
  } catch (error) {
    console.error('获取仪表盘数据失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.kpi-card { border: none; transition: all 0.3s; }
.kpi-card:hover { transform: translateY(-5px); }
.kpi-title { font-size: 14px; color: #909399; }
.kpi-header { display: flex; justify-content: space-between; align-items: center; }
.kpi-value { font-size: 28px; font-weight: bold; margin: 15px 0; color: #303133; }
.up { color: #f56c6c; font-weight: bold;}
.down { color: #67c23a; font-weight: bold;}
.text-grey { color: #999; font-size: 12px; }

/* 柱状图样式 */
.mock-chart { height: 220px; display: flex; align-items: flex-end; justify-content: space-around; border-bottom: 1px solid #eee; padding-bottom: 10px;}
.bar-wrapper { height: 100%; display: flex; align-items: flex-end; width: 40px; justify-content: center;}
.bar { width: 30px; background: linear-gradient(to top, #ff8a9a, #ff2442); border-radius: 6px 6px 0 0; transition: height 0.8s ease-out; min-height: 2%; box-shadow: 0 4px 10px rgba(255, 36, 66, 0.2);}
.bar:hover { opacity: 0.8; cursor: pointer; }
.chart-label { display: flex; justify-content: space-around; margin-top: 10px; color: #666; font-size: 13px; }

.todo-list { min-height: 250px; }
.todo-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px dashed #eee; }
.todo-item:last-child { border-bottom: none; }
</style>