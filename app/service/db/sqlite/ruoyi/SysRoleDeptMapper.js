const Service = require('egg').Service;

class SysRoleDeptMapperService extends Service {
    mapper(sqlid, values, params) {
        return this.app.mapper('mapper/mysql/ruoyi/SysRoleDeptMapper.xml', sqlid, values, params)
    }

    db() {
        return this.app.sqlite.get('ruoyi');
    }

    sysRoleDeptResultMapper(values, params) {
        return this.mapper('SysRoleDeptResult', values, params);
    }

    async sysRoleDeptResult(values, params) {
        return await this.db().resultMap(this.sysRoleDeptResultMapper(values, params));
    }

    deleteRoleDeptByRoleIdMapper(values, params) {
        return this.mapper('deleteRoleDeptByRoleId', values, params);
    }

    async deleteRoleDeptByRoleId(values, params) {
        return await this.db().del(this.deleteRoleDeptByRoleIdMapper(values, params));
    }

    selectCountRoleDeptByDeptIdMapper(values, params) {
        return this.mapper('selectCountRoleDeptByDeptId', values, params);
    }

    async selectCountRoleDeptByDeptId(values, params) {
        return await this.db().select(this.selectCountRoleDeptByDeptIdMapper(values, params));
    }

    deleteRoleDeptMapper(values, params) {
        return this.mapper('deleteRoleDept', values, params);
    }

    async deleteRoleDept(values, params) {
        return await this.db().del(this.deleteRoleDeptMapper(values, params));
    }

    batchRoleDeptMapper(values, params) {
        return this.mapper('batchRoleDept', values, params);
    }

    async batchRoleDept(values, params) {
        return await this.db().insert(this.batchRoleDeptMapper(values, params));
    }
}

module.exports = SysRoleDeptMapperService;