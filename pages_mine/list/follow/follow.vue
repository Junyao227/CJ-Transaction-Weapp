<template>
  <view class="u-page">
    <scroll-view class="scroll-view" :scroll-y="true" @scrolltolower="loadMoreFollowedUsers" lower-threshold="50">
      <u-list>
        <u-list-item v-for="(user, index) in followedUsers" :key="index" @click="goToFollowedUserDetail(user.user_id)">
          <view class="followed-details">
            <!-- 外部容器包裹头像，控制头像与其他信息的距离 -->
            <view class="followed-avatar">
              <u-avatar :src="user.avatar" size="40" shape="square" />
            </view>

            <view class="followed-info">
              <text class="followed-name">{{ user.nickname }}</text>
              <text class="followed-id">ID: {{ user.user_id }}</text>
            </view>
          </view>
        </u-list-item>
      </u-list>

      <!-- 显示加载中动画 -->
      <u-loading-icon :show="loading" text="加载中..." />
	  <u-empty :show="!followedUsers || followedUsers.length === 0" mode="data"></u-empty>
	  
	  
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      followedUsers: [], // 存储关注的用户列表
      loading: false // 加载状态
    };
  },
  onLoad() {
    this.loadFollowedUsers();
  },
  methods: {
    // 加载关注的用户列表数据
    async loadFollowedUsers() {
      if (this.loading) return; // 防止重复加载

      this.loading = true; // 设置为加载中
      try {
        const userId = uni.getStorageSync('USER_INFO').user_id; // 当前用户ID
        const res = await uniCloud.callFunction({
          name: 'getFollowedUsers', // 云函数名称
          data: { user_id: userId }
        });

        if (res.result.code === 0) {
          // 将新数据追加到已有的关注用户列表中
          this.followedUsers = [...this.followedUsers, ...res.result.data];
        } else {
          uni.showToast({ icon: 'none', title: '获取关注列表失败' });
        }
      } catch (err) {
        uni.showToast({ icon: 'none', title: '加载失败' });
      } finally {
        this.loading = false; // 加载完毕
      }
    },
    // 点击关注用户跳转到详细页面
    goToFollowedUserDetail(userId) {
      uni.navigateTo({
        url: `/pages_mine/list/followedUserDetail/followedUserDetail?userId=${userId}`
      });
    },
    // 滚动到底部时加载更多关注的用户
    loadMoreFollowedUsers() {
      this.loadFollowedUsers(); // 加载更多关注的用户
    }
  }
};
</script>

<style scoped>
.u-page {
  padding: 10px;
}

.followed-details {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.followed-avatar {
  margin-right: 15px; /* 增加头像与其他信息之间的间距 */
}

.followed-info {
  display: flex;
  align-items: center; /* 让昵称和ID在同一行 */
}

.followed-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-right: 15px; /* 增加昵称和ID之间的间距 */
}

.followed-id {
  font-size: 12px;
  color: #888;
}

u-button {
  margin-top: 20px;
}

/* ScrollView样式调整 */
.scroll-view {
  max-height: 100%;
  overflow-y: auto;
}
</style>
