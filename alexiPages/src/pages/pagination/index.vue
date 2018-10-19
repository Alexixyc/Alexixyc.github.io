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
export default {
    data() {
        return {
            total: 120,
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
