export const texts = {
    common: {
        loading: '加载中...',
        empty: '暂无数据',
        error: '发生错误，请稍后重试',
        success: '操作成功',
        unauthorized: '认证失败，请重新登录'
    },
    pagination: {
        prev: '上一页',
        next: '下一页',
        pageInfo(start, end, total) {
            return `显示 ${start}-${end} 条，共 ${total} 条`;
        }
    },
    confirm: {
        title: '确认操作',
        ok: '确定',
        cancel: '取消'
    },
    vip: {
        deleteTitle: '删除确认',
        deleteMessage: '确定要删除这个VIP等级吗？',
        saveSuccess: 'VIP等级保存成功'
    },
    pk: {
        cancelTitle: 'PK挑战取消确认',
        cancelMessage: '确定要取消该PK挑战吗？取消成功后将退还双方押金。',
        settleSuccess: 'PK挑战结算成功',
        cancelSuccess: 'PK挑战取消成功'
    }
};

export default texts;


