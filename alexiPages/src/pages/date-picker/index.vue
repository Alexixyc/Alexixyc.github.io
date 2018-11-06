<template>
    <div>
        <div class="text">所选日期：{{date}}</div>
        <ax-date-picker
            class="ax-date-picker"
            v-model="date"
            :disabled="false"
            :placeholder="'请选择会议日期'"
            @change="change">
        </ax-date-picker>
    </div>
</template>
<script>
export default {
    data() {
        return {
            date: new Date()
        }
    },
    methods: {
        change(val) {
            console.log('change监听', val)
        }
    }
}
</script>
<style lang="less" scoped>
.ax-date-picker {
    margin: 0 auto;
}
.text {
    font-size: 13px;
    margin-bottom: 20px;
}
</style>


