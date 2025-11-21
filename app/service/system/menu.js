/*
 * @Description: 菜单服务层
 * @Author: AI Assistant
 * @Date: 2025-10-23
 */

const Service = require('egg').Service;

// 菜单常量
const TYPE_DIR = 'M';     // 目录
const TYPE_MENU = 'C';    // 菜单
const TYPE_BUTTON = 'F';  // 按钮
const YES_FRAME = 0;      // 是外链
const NO_FRAME = 1;       // 否外链
const LAYOUT = 'Layout';
const PARENT_VIEW = 'ParentView';
const INNER_LINK = 'InnerLink';

class MenuService extends Service {

  /**
   * 查询菜单列表
   * @param {object} menu - 查询参数
   * @param {number} userId - 用户ID
   * @return {array} 菜单列表
   */
  async selectMenuList(menu = {}, userId) {
    const { ctx } = this;
    
    let menus;
    
    // 管理员显示所有菜单信息
    if (ctx.helper.isAdmin(userId)) {
      const conditions = {
        menuName: menu.menuName,
        visible: menu.visible,
        status: menu.status
      };
      menus = await ctx.helper.getDB(ctx).sysMenuMapper.selectMenuList([], conditions);
    } else {
      // 普通用户显示有权限的菜单
      const conditions = {
        menuName: menu.menuName,
        visible: menu.visible,
        status: menu.status,
        params: {
          userId
        }
      };
      menus = await ctx.helper.getDB(ctx).sysMenuMapper.selectMenuListByUserId([], conditions);
    }
    
    return menus || [];
  }

  /**
   * 根据菜单ID查询菜单
   * @param {number} menuId - 菜单ID
   * @return {object} 菜单信息
   */
  async selectMenuById(menuId) {
    const { ctx } = this;
    
    const menus = await ctx.helper.getDB(ctx).sysMenuMapper.selectMenuById([], {menuId});
    
    return menus && menus.length > 0 ? menus[0] : null;
  }

  /**
   * 根据用户ID查询权限标识
   * @param {number} userId - 用户ID
   * @return {array} 权限标识列表
   */
  async selectPermsByUserId(userId) {
    const { ctx } = this;
    
    // 如果是管理员，返回所有权限
    if (ctx.helper.isAdmin(userId)) {
      return ['*:*:*'];
    }
    
    // 查询用户权限
    const sql = `
      SELECT DISTINCT m.perms
      FROM sys_menu m
      LEFT JOIN sys_role_menu rm ON m.menu_id = rm.menu_id
      LEFT JOIN sys_user_role ur ON ur.role_id = rm.role_id
      LEFT JOIN sys_role r ON r.role_id = ur.role_id
      WHERE m.status = '0' AND r.status = '0' AND ur.user_id = ?
    `;
    
    const rows = await ctx.app.mysql.get('ruoyi').query(sql, [userId]);
    
    const perms = [];
    rows.forEach(row => {
      if (row.perms && row.perms.trim()) {
        perms.push(...row.perms.trim().split(','));
      }
    });
    
    return [...new Set(perms)];  // 去重
  }

  /**
   * 根据用户ID查询菜单树
   * @param {number} userId - 用户ID
   * @return {array} 菜单树
   */
  async selectMenuTreeByUserId(userId) {
    const { ctx } = this;
    
    let menus;
    
    // 如果是管理员，查询所有菜单
    if (ctx.helper.isAdmin(userId)) {
      menus = await ctx.helper.getDB(ctx).sysMenuMapper.selectMenuTreeAll();
    } else {
      // 查询用户菜单
      menus = await ctx.helper.getDB(ctx).sysMenuMapper.selectMenuTreeByUserId([],{userId});
    }
    
    // 使用 getChildPerms 构建菜单树
    return this.getChildPerms(menus, 0);
  }

  /**
   * 构建前端路由菜单树
   * @param {array} menus - 菜单列表
   * @param {number} parentId - 父菜单ID
   * @return {array} 菜单树
   */
  buildRouterMenuTree(menus, parentId) {
    const tree = [];
    
    menus.forEach(menu => {
      if (menu.parentId === parentId) {
        const children = this.buildRouterMenuTree(menus, menu.menuId);
        
        const menuNode = {
          name: menu.routeName || menu.menuName,
          path: menu.path,
          hidden: menu.visible === '1',
          component: menu.component,
          query: menu.query,
          meta: {
            title: menu.menuName,
            icon: menu.icon,
            noCache: menu.isCache === '1',
            link: menu.path
          }
        };
        
        if (children.length > 0) {
          menuNode.children = children;
          menuNode.alwaysShow = true;
          menuNode.redirect = 'noRedirect';
        }
        
        tree.push(menuNode);
      }
    });
    
    return tree;
  }

  /**
   * 根据父节点ID获取所有子节点
   * @param {array} list - 菜单列表
   * @param {number} parentId - 父节点ID
   * @return {array} 子节点列表
   */
  getChildPerms(list, parentId) {
    const returnList = [];
    
    for (const menu of list) {
      // 根据传入的某个父节点ID，遍历该父节点的所有子节点
      if (menu.parentId === parentId) {
        this.recursionFn(list, menu);
        returnList.push(menu);
      }
    }
    
    return returnList;
  }

  /**
   * 构建菜单树（用于管理界面）
   * @param {array} menus - 菜单列表
   * @return {array} 菜单树
   */
  buildMenuTree(menus) {
    const { ctx } = this;
    
    // 找出所有菜单ID
    const menuIds = menus.map(m => m.menuId);
    
    // 找出顶级节点（父节点不在列表中的）
    const tree = [];
    menus.forEach(menu => {
      if (!menuIds.includes(menu.parentId)) {
        this.recursionFn(menus, menu);
        tree.push(menu);
      }
    });
    
    return tree.length > 0 ? tree : menus;
  }

  /**
   * 递归列表
   * @param {array} list - 菜单列表
   * @param {object} t - 当前菜单节点
   */
  recursionFn(list, t) {
    // 得到子节点列表
    const childList = this.getChildList(list, t);
    t.children = childList;
    
    for (const tChild of childList) {
      if (this.hasChild(list, tChild)) {
        this.recursionFn(list, tChild);
      }
    }
  }

  /**
   * 得到子节点列表
   * @param {array} list - 菜单列表
   * @param {object} t - 当前菜单节点
   * @return {array} 子节点列表
   */
  getChildList(list, t) {
    const tlist = [];
    
    for (const n of list) {
      if (n.parentId === t.menuId) {
        tlist.push(n);
      }
    }
    
    return tlist;
  }

  /**
   * 判断是否有子节点
   * @param {array} list - 菜单列表
   * @param {object} t - 当前菜单节点
   * @return {boolean} 是否有子节点
   */
  hasChild(list, t) {
    return this.getChildList(list, t).length > 0;
  }

  /**
   * 构建菜单树选择结构
   * @param {array} menus - 菜单列表
   * @return {array} 树选择结构
   */
  buildMenuTreeSelect(menus) {
    const menuTree = this.buildMenuTree(menus);
    return this.convertToTreeSelect(menuTree);
  }

  /**
   * 转换为树选择结构
   * @param {array} menus - 菜单树
   * @return {array} 树选择结构
   */
  convertToTreeSelect(menus) {
    const treeSelect = [];
    
    menus.forEach(menu => {
      const node = {
        id: menu.menuId,
        label: menu.menuName
      };
      
      if (menu.children && menu.children.length > 0) {
        node.children = this.convertToTreeSelect(menu.children);
      }
      
      treeSelect.push(node);
    });
    
    return treeSelect;
  }

  /**
   * 根据角色ID查询菜单ID列表
   * @param {number} roleId - 角色ID
   * @return {array} 菜单ID列表
   */
  async selectMenuListByRoleId(roleId) {
    const { ctx } = this;
    
    // 查询角色信息
    const role = await ctx.service.system.role.selectRoleById(roleId);
    const menuCheckStrictly = role && role.menuCheckStrictly;

    return await ctx.helper.getDB(ctx).sysMenuMapper.selectMenuListByRoleId([],{roleId,menuCheckStrictly});
    
  }

  /**
   * 校验菜单名称是否唯一
   * @param {object} menu - 菜单对象
   * @return {boolean} true-唯一 false-不唯一
   */
  async checkMenuNameUnique(menu) {
    const { ctx } = this;
    
    const menuId = menu.menuId || -1;
    const conditions = {
      menuName: menu.menuName,
      parentId: menu.parentId
    };
    
    const menus = await ctx.helper.getDB(ctx).sysMenuMapper.checkMenuNameUnique([], conditions);
    
    if (menus && menus.length > 0 && menus[0].menuId !== menuId) {
      return false;
    }
    
    return true;
  }

  /**
   * 是否存在子菜单
   * @param {number} menuId - 菜单ID
   * @return {boolean} true-存在 false-不存在
   */
  async hasChildByMenuId(menuId) {
    const { ctx } = this;
    
    const result = await ctx.helper.getDB(ctx).sysMenuMapper.hasChildByMenuId([], {menuId});
    
    return result && result.length > 0 && result[0].count > 0;
  }

  /**
   * 检查菜单是否已分配给角色
   * @param {number} menuId - 菜单ID
   * @return {boolean} true-已分配 false-未分配
   */
  async checkMenuExistRole(menuId) {
    const { ctx } = this;
    
    const sql = `
      SELECT COUNT(1) as count FROM sys_role_menu WHERE menu_id = ?
    `;
    
    const result = await ctx.app.mysql.get('ruoyi').query(sql, [menuId]);
    
    return result && result.length > 0 && result[0].count > 0;
  }

  /**
   * 新增菜单
   * @param {object} menu - 菜单对象
   * @return {number} 影响行数
   */
  async insertMenu(menu) {
    const { ctx } = this;
    
    // 设置创建信息
    menu.createBy = ctx.state.user.userName;
    
    // 插入菜单
    const result = await ctx.helper.getMasterDB(ctx).sysMenuMapper.insertMenu([], menu);
    
    return result;
  }

  /**
   * 修改菜单
   * @param {object} menu - 菜单对象
   * @return {number} 影响行数
   */
  async updateMenu(menu) {
    const { ctx } = this;
    
    // 设置更新信息
    menu.updateBy = ctx.state.user.userName;
    
    // 更新菜单
    const result = await ctx.helper.getMasterDB(ctx).sysMenuMapper.updateMenu([], menu);
    
    return result;
  }

  /**
   * 删除菜单
   * @param {number} menuId - 菜单ID
   * @return {number} 影响行数
   */
  async deleteMenuById(menuId) {
    const { ctx } = this;
    
    // 删除菜单
    const result = await ctx.helper.getMasterDB(ctx).sysMenuMapper.deleteMenuById([], {menuId});
    
    return result;
  }

  /**
   * 根据角色ID查询权限标识
   * @param {number} roleId - 角色ID
   * @return {array} 权限标识列表
   */
  async selectMenuPermsByRoleId(roleId) {
    const { ctx } = this;
    
    const sql = `
      SELECT DISTINCT m.perms
      FROM sys_menu m
      LEFT JOIN sys_role_menu rm ON m.menu_id = rm.menu_id
      WHERE m.status = '0' AND rm.role_id = ?
    `;
    
    const rows = await ctx.app.mysql.get('ruoyi').query(sql, [roleId]);
    
    const perms = [];
    rows.forEach(row => {
      if (row.perms && row.perms.trim()) {
        perms.push(...row.perms.trim().split(','));
      }
    });
    
    return [...new Set(perms)];  // 去重
  }

  /**
   * 构建前端路由所需要的菜单（完整版）
   * @param {array} menus - 菜单列表
   * @return {array} 路由列表
   */
  buildMenus(menus) {
    const routers = [];
    
    for (const menu of menus) {
      const router = {
        hidden: menu.visible === '1',
        name: this.getRouteName(menu),
        path: this.getRouterPath(menu),
        component: this.getComponent(menu),
        query: menu.query,
        meta: {
          title: menu.menuName,
          icon: menu.icon,
          noCache: menu.isCache === '1',
          link: null //menu.path
        }
      };
      
      const cMenus = menu.children || [];
      
      // 目录类型并且有子菜单
      if (cMenus.length > 0 && menu.menuType === TYPE_DIR) {
        router.alwaysShow = true;
        router.redirect = 'noRedirect';
        router.children = this.buildMenus(cMenus);
      }
      // 菜单内部跳转
      else if (this.isMenuFrame(menu)) {
        router.meta = null;
        const children = {
          path: menu.path,
          component: menu.component,
          name: this.getRouteNameFromPath(menu.routeName, menu.path),
          meta: {
            title: menu.menuName,
            icon: menu.icon,
            noCache: menu.isCache === '1',
            link: null //menu.path
          },
          query: menu.query
        };
        router.children = [children];
      }
      // 一级目录内链
      else if (menu.parentId === 0 && this.isInnerLink(menu)) {
        router.meta = {
          title: menu.menuName,
          icon: menu.icon
        };
        router.path = '/';
        const routerPath = this.innerLinkReplaceEach(menu.path);
        const children = {
          path: routerPath,
          component: INNER_LINK,
          name: this.getRouteNameFromPath(menu.routeName, routerPath),
          meta: {
            title: menu.menuName,
            icon: menu.icon,
            link: menu.path
          }
        };
        router.children = [children];
      }
      
      routers.push(router);
    }
    
    return routers;
  }

  /**
   * 获取路由名称
   * @param {object} menu - 菜单信息
   * @return {string} 路由名称
   */
  getRouteName(menu) {
    // 非外链并且是一级目录（类型为目录）
    if (this.isMenuFrame(menu)) {
      return '';
    }
    return this.getRouteNameFromPath(menu.routeName, menu.path);
  }

  /**
   * 获取路由名称，如没有配置路由名称则取路由地址
   * @param {string} name - 路由名称
   * @param {string} path - 路由地址
   * @return {string} 路由名称（首字母大写）
   */
  getRouteNameFromPath(name, path) {
    const routerName = name || path || '';
    // 首字母大写
    return routerName.charAt(0).toUpperCase() + routerName.slice(1);
  }

  /**
   * 获取路由地址
   * @param {object} menu - 菜单信息
   * @return {string} 路由地址
   */
  getRouterPath(menu) {
    let routerPath = menu.path;
    
    // 内链打开外网方式
    if (menu.parentId !== 0 && this.isInnerLink(menu)) {
      routerPath = this.innerLinkReplaceEach(routerPath);
    }
    // 非外链并且是一级目录（类型为目录）
    else if (menu.parentId === 0 && menu.menuType === TYPE_DIR && menu.isFrame === NO_FRAME) {
      routerPath = '/' + menu.path;
    }
    // 非外链并且是一级目录（类型为菜单）
    else if (this.isMenuFrame(menu)) {
      routerPath = '/';
    }
    
    return routerPath;
  }

  /**
   * 获取组件信息
   * @param {object} menu - 菜单信息
   * @return {string} 组件信息
   */
  getComponent(menu) {
    let component = LAYOUT;
    
    if (menu.component && !this.isMenuFrame(menu)) {
      component = menu.component;
    }
    else if (!menu.component && menu.parentId !== 0 && this.isInnerLink(menu)) {
      component = INNER_LINK;
    }
    else if (!menu.component && this.isParentView(menu)) {
      component = PARENT_VIEW;
    }
    
    return component;
  }

  /**
   * 是否为菜单内部跳转
   * @param {object} menu - 菜单信息
   * @return {boolean} 结果
   */
  isMenuFrame(menu) {
    return menu.parentId === 0 
      && menu.menuType === TYPE_MENU 
      && menu.isFrame === NO_FRAME;
  }

  /**
   * 是否为内链组件
   * @param {object} menu - 菜单信息
   * @return {boolean} 结果
   */
  isInnerLink(menu) {
    return menu.isFrame === NO_FRAME && this.isHttp(menu.path);
  }

  /**
   * 是否为parent_view组件
   * @param {object} menu - 菜单信息
   * @return {boolean} 结果
   */
  isParentView(menu) {
    return menu.parentId !== 0 && menu.menuType === TYPE_DIR;
  }

  /**
   * 判断是否为http(s)://开头
   * @param {string} link - 链接
   * @return {boolean} 结果
   */
  isHttp(link) {
    if (!link) return false;
    return link.startsWith('http://') || link.startsWith('https://');
  }

  /**
   * 内链域名特殊字符替换
   * @param {string} path - 路径
   * @return {string} 替换后的内链域名
   */
  innerLinkReplaceEach(path) {
    if (!path) return '';
    
    return path
      .replace(/http:\/\//g, '')
      .replace(/https:\/\//g, '')
      .replace(/www\./g, '')
      .replace(/\./g, '/')
      .replace(/:/g, '/');
  }
}

module.exports = MenuService;


