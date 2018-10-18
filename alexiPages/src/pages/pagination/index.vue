<template>
    <div class="pagi">
        <ax-pagination
            :total="total"
            :currentPage="currentPage"
            :pageSize="pageSize"
            @changePage="changePage">
        </ax-pagination>
        <div class="label">当前是第{{currentPage}}页</div>
    </div>
</template>
<script>
import pagination from './com/index'
export default {
    components: {
        'ax-pagination': pagination
    },
    data() {
        return {
            total: 50,
            currentPage: 1,
            pageSize: 10
        }
    },
    methods: {
        changePage(val) {
            console.log(val)
            this.currentPage = val
        }
    }
}
</script>

<style scoped src = "./style.less" lang="less"></style>
