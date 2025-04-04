
<template>
  <view class="container">
    <view v-if="!loading" class="content">
      <!-- 商品基础信息区 -->
      <view class="basic-info">
        <view class="seller-info">
          <view class="seller-left">
            <image :src="sellerAndItemInfo.avatar" class="avatar" mode="aspectFill" />
            <view class="seller-detail">
              <text class="nickname">{{ sellerAndItemInfo.nickname }}</text>
              <view class="credit-info">
                <uni-icons type="star-filled" size="12" color="#FFB800"/>
              </view>
            </view>
          </view>
          <view class="follow-btn">
            <uni-icons v-if="isFollowed" type="checkmarkempty" size="14" color="#07C160"/>
            <text :class="['follow-text', isFollowed ? 'followed' : '']" @click="handleFollow">
              {{ isFollowed ? '已关注' : '关注' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 商品图片展示 -->
      <view class="goods-images">
        <image :src="sellerAndItemInfo.imageUrl" class="main-image" mode="aspectFill" />
      </view>

      <!-- 价格信息 -->
      <view class="price-section">
        <view class="current-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ sellerAndItemInfo.price }}</text>
        </view>
      </view>

      <!-- 商品描述 -->
      <view class="description-card">
        <view class="desc-header">
          <uni-icons type="info" size="16" color="#333333"/>
          <text class="desc-title">商品描述</text>
        </view>
        <text class="desc-content">{{ sellerAndItemInfo.description }}</text>
        <view class="tags">
          <text class="tag">7天可退</text>
          <text class="tag">认证发布</text>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="bottom-actions">
        <view class="action-left">
          <view class="collect-btn" @click="handleCollect">
            <u-icon :name="isCollected ? 'heart-fill' : 'heart'" size="24" :color="isCollected ? '#FF4D4F' : '#666666'"/>
            <text :class="['collect-text', isCollected ? 'collected' : '']">{{ isCollected ? '已收藏' : '收藏' }}</text>
          </view>
          <view class="report-btn">
            <u-icon name="info-circle" size="24" color="#666666"/>
            <text class="report-text">举报</text>
          </view>
        </view>
        <view class="action-right">
          <button class="want-btn" @click="startChat">我想要</button>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-else class="loading-wrapper">
      <uni-icons type="spinner-cycle" size="24" color="#666666"/>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>
<script>
export default {
	data() {
		return {
			sellerAndItemInfo: {}, // 商品对象
			isFollowed: false, // 关注状态
			isCollected: false, // 收藏状态
			loading: true // 页面加载状态
		};
	},
	onLoad(options) {
		this.getDetailInfo(options);
	},
	methods: {
		startChat() {
			const userInfo = uni.getStorageSync('USER_INFO');
			uni.navigateTo({
				url: `/pages/item/chat/chat?sellerAndItemInfo=${JSON.stringify(this.sellerAndItemInfo)}`
			});
		},
		getDetailInfo(options) {
			if (options.item) {
				const item = JSON.parse(options.item); // 解析传递的商品对象
				// 调用云函数获取用户信息
				uniCloud.callFunction({
					name: 'getUserInfoByUserId',
					data: {
						userId: item.publisher_id // 传递 WxOpenId 参数
					},
					success: (res) => {
						if (res.result.success) {
							const sellerInfo = res.result.data;
							const { nickname, avatar } = sellerInfo;
							const sellerAndItemInfo = { ...item, nickname, avatar };
							this.sellerAndItemInfo = sellerAndItemInfo;

							this.checkFollowStatus(); // 检查是否已关注
							this.checkCollectStatus(); // 检查是否已收藏
						} else {
							uni.showToast({
								icon: 'none',
								title: res.result.message || '查询失败'
							});
						}
						
					},
					fail: (err) => {
						uni.showToast({
							icon: 'none',
							title: '调用云函数失败'
						});
						console.error('云函数调用失败:', err);
						this.loading = false; // 加载完成，设置 loading 为 false
					}
				});
			}
		},
		checkFollowStatus() {
			if (!this.sellerAndItemInfo.publisher_id) return;
			// 检查是否已关注
			uniCloud.callFunction({
				name: 'checkFollowStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.sellerAndItemInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = res.result.isFollowed;
					}
				},
				fail: (err) => {
					console.error('检查关注状态失败:', err);
				}
			});
		},
		checkCollectStatus() {
			if (!this.sellerAndItemInfo._id) return;
			// 检查是否已收藏
			uniCloud.callFunction({
				name: 'checkCollectStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.sellerAndItemInfo._id,
					type: 0 // 0 表示二手商品
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = res.result.isCollected;
						this.loading = false; // 加载完成，设置 loading 为 false
					}
				},
				fail: (err) => {
					console.error('检查收藏状态失败:', err);
				}
			});
		},
		handleCollect() {
		    const action = this.isCollected ? 'uncollectItem' : 'collectItem';
		    uniCloud.callFunction({
		        name: action,
		        data: {
		            userId: uni.getStorageSync('USER_INFO').user_id,
		            itemId: this.sellerAndItemInfo._id,
		            type: 0 // 0 表示二手商品
		        },
		        success: (res) => {
		            if (res.result.success) {
		                this.isCollected = !this.isCollected;
		                uni.showToast({
		                    title: this.isCollected ? '收藏成功' : '取消收藏成功',
		                    icon: 'success'
		                });
		            }
		        },
		        fail: (err) => {
		            console.error('收藏操作失败:', err);
		            uni.showToast({
		                title: '操作失败',
		                icon: 'none'
		            });
		        }
		    });
		},
		handleFollow() {
		    const action = this.isFollowed ? 'unfollowUser' : 'followUser';
		    uniCloud.callFunction({
		        name: action,
		        data: {
		            userId: uni.getStorageSync('USER_INFO').user_id,
		            followedUserId: this.sellerAndItemInfo.publisher_id
		        },
		        success: (res) => {
		            if (res.result.success) {
		                this.isFollowed = !this.isFollowed;
		                uni.showToast({
		                    title: this.isFollowed ? '关注成功' : '取消关注成功',
		                    icon: 'success'
		                });
		            }
		        },
		        fail: (err) => {
		            console.error('关注操作失败:', err);
		            uni.showToast({
		                title: '操作失败',
		                icon: 'none'
		            });
		        }
		    });
		}
	}
};
</script>

<style>
page {
  height: 100%;
  background-color: #F8F8F8;
}

.container {
  min-height: 100%;
  padding-bottom: 120rpx;
}

.content {
  padding: 24rpx;
}

.basic-info {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.seller-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seller-left {
  display: flex;
  align-items: center;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 44rpx;
  margin-right: 20rpx;
}

.seller-detail {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 16px;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.credit-info {
  display: flex;
  align-items: center;
}



.follow-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  border: 1px solid #EEEEEE;
  border-radius: 32rpx;
}

.follow-text {
  font-size: 14px;
  color: #666666;
  margin-left: 8rpx;
}

.follow-text.followed {
  color: #07C160;
}

.goods-images {
  position: relative;
  margin-bottom: 24rpx;
}

.main-image {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
}


.price-section {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.current-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 12rpx;
}

.price-symbol {
  font-size: 20px;
  color: #FF4D4F;
  font-weight: 500;
}

.price-value {
  font-size: 32px;
  color: #FF4D4F;
  font-weight: 600;
}

.original-price {
  display: flex;
  align-items: center;
}

.original-label {
  font-size: 12px;
  color: #999999;
  margin-right: 8rpx;
}

.original-value {
  font-size: 12px;
  color: #999999;
  text-decoration: line-through;
}

.description-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.desc-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.desc-title {
  font-size: 16px;
  color: #333333;
  font-weight: 500;
  margin-left: 8rpx;
}

.desc-content {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  font-size: 12px;
  color: #666666;
  background-color: #F5F5F5;
  padding: 8rpx 16rpx;
  border-radius: 4rpx;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #FFFFFF;
  border-top: 1px solid #EEEEEE;
}

.action-left {
  display: flex;
  gap: 48rpx;
}

.collect-btn, .report-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.collect-text, .report-text {
  font-size: 12px;
  color: #666666;
  margin-top: 8rpx;
}

.collect-text.collected {
  color: #FF4D4F;
}

.want-btn {
  background-color: #07C160;
  color: #FFFFFF;
  font-size: 16px;
  padding: 20rpx 64rpx;
  border-radius: 32rpx;
  border: none;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-text {
  font-size: 14px;
  color: #666666;
  margin-top: 16rpx;
}
</style>
