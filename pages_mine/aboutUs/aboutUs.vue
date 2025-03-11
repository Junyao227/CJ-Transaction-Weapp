<template>
  <view class="container">

    <!-- 公司介绍 -->
    <view class="section">
      <text class="section-title">公司简介</text>
      <text class="section-content">
        我们是一家致力于创新的公司，专注于为客户提供高质量的产品和服务。我们的团队拥有丰富的行业经验，并以满足客户需求为核心。
      </text>
    </view>

    <!-- 联系方式 -->
    <view class="section">
      <text class="section-title">联系方式</text>
      <view class="contact-info">
        <text>邮箱：info@example.com</text>
        <text>电话：+123456789</text>
        <text>地址：某某市某某街道</text>
      </view>
    </view>

    <!-- 社交媒体 -->
    <view class="section">
      <text class="section-title">关注我们</text>
      <view class="social-media">
        <u-icon name="facebook" size="30" color="#3b5998" />
        <u-icon name="twitter" size="30" color="#00aced" />
        <u-icon name="linkedin" size="30" color="#0e76a8" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: bold;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.section-content {
  font-size: 16px;
  color: #555;
}

.team-section .team-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.contact-info text {
  font-size: 16px;
  color: #333;
}

.social-media {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}
</style>
