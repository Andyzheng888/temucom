// 跨境电商店铺查询器 - 支持Temu和SHEIN
let historyData = [];

// 页面加载完成后执行
window.onload = function() {
    // 获取页面元素
    const platformSelect = document.getElementById('platform');
    const mallIdInput = document.getElementById('mallId');
    const countrySelect = document.getElementById('country');
    const countrySearch = document.getElementById('countrySearch');
    const countryInfo = document.getElementById('countryInfo');
    const countryCount = document.getElementById('countryCount');
    const searchBtn = document.getElementById('searchBtn');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    
    // 搜索弹窗相关元素
    const searchToggle = document.getElementById('searchToggle');
    const searchPopup = document.getElementById('searchPopup');
    const closeSearch = document.getElementById('closeSearch');
    const searchResults = document.getElementById('searchResults');
    const searchCount = document.getElementById('searchCount');
    
    // 帮助弹窗相关元素
    const helpBtn = document.getElementById('helpBtn');
    const infoBtn = document.getElementById('infoBtn');
    const helpPopup = document.getElementById('helpPopup');
    const closeHelp = document.getElementById('closeHelp');
    
    // 登录按钮相关元素
    const temuLoginBtn = document.getElementById('temuLoginBtn');
    const sheinLoginBtn = document.getElementById('sheinLoginBtn');
    
    // SHEIN相关元素
    const temuSection = document.getElementById('temuSection');
    const sheinSection = document.getElementById('sheinSection');
    const storeCodeInput = document.getElementById('storeCode');
    
    // 存储当前平台的所有国家选项
    let currentCountries = [];
    
    // 创建搜索遮罩层
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.id = 'searchOverlay';
    document.body.appendChild(searchOverlay);
    
    // 初始化默认显示Temu站点
    updateTemuCountries();
    
    // 加载历史记录
    loadHistory();
    
    // 平台切换事件
    platformSelect.onchange = function() {
        const platform = this.value;
        
        if (platform === 'temu') {
            temuSection.style.display = 'block';
            sheinSection.style.display = 'none';
            searchBtn.textContent = '查询店铺';
            updateTemuCountries();
        } else if (platform === 'shein') {
            temuSection.style.display = 'none';
            sheinSection.style.display = 'block';
            searchBtn.textContent = '查询SHEIN';
            updateSheinCountries();
        }
    };
    
    // 搜索按钮事件
    searchToggle.onclick = function() {
        showSearchPopup();
    };
    
    // 关闭搜索弹窗
    closeSearch.onclick = function() {
        hideSearchPopup();
    };
    
    // 遮罩层点击关闭
    searchOverlay.onclick = function() {
        hideSearchPopup();
        hideHelpPopup();
    };
    
    // 搜索框事件监听
    countrySearch.oninput = function() {
        const searchTerm = this.value.toLowerCase();
        filterCountriesInPopup(searchTerm);
    };
    
    // 帮助按钮事件
    helpBtn.onclick = function() {
        showHelpPopup();
    };
    
    infoBtn.onclick = function() {
        showHelpPopup();
    };
    
    // 关闭帮助弹窗
    closeHelp.onclick = function() {
        hideHelpPopup();
    };
    
    // Temu卖家中心登录按钮
    temuLoginBtn.onclick = function() {
        const temuSellerUrl = 'https://agentseller.temu.com/';
        chrome.tabs.create({ url: temuSellerUrl });
    };
    
    // SHEIN卖家中心登录按钮
    sheinLoginBtn.onclick = function() {
        const sheinSellerUrl = 'https://sso.geiwohuo.com/';
        chrome.tabs.create({ url: sheinSellerUrl });
    };
    
    // 国家选择框事件
    countrySelect.onchange = function() {
        if (this.value) {
            this.style.borderColor = '#667eea';
        }
    };
    

    // 搜索按钮点击
    searchBtn.onclick = function() {
        const platform = platformSelect.value;
        const country = countrySelect.value;
        
        if (platform === 'temu') {
            handleTemuSearch(mallIdInput.value, country);
        } else if (platform === 'shein') {
            handleSheinSearch(country);
        }
    };
    
    // 清空历史
    clearHistoryBtn.onclick = function() {
        if (confirm('确定清空历史记录吗？')) {
            historyData = [];
            localStorage.removeItem('crossborder_history');
            showHistory();
        }
    };
    
    // 回车搜索
    mallIdInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    };
    
    storeCodeInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    };
    

    // 历史记录访问按钮事件委托
    historyList.onclick = function(e) {
        if (e.target && e.target.classList.contains('visit-btn')) {
            const platform = e.target.getAttribute('data-platform');
            const id = e.target.getAttribute('data-id');
            const country = e.target.getAttribute('data-country');
            const type = e.target.getAttribute('data-type') || 'store';
            visitFromHistory(platform, id, country, type);
        }
    };
};

// 处理Temu搜索
function handleTemuSearch(mallId, country) {
    if (!mallId) {
        alert('请输入店铺ID');
        return;
    }
    
    let url;
    if (country === 'www.temu.com/tr-en') {
        // 土耳其站点使用特殊URL格式
        url = 'https://www.temu.com/tr-en/mall.html?mall_id=' + mallId;
    } else {
        // 其他国家使用标准格式
        url = 'https://' + country + '/mall.html?mall_id=' + mallId;
    }
    
    chrome.tabs.create({ url: url });
    
    addToHistory('temu', mallId, country, 'store');
    document.getElementById('mallId').value = '';
    showHistory();
}

// 处理SHEIN搜索
function handleSheinSearch(country) {
    const storeCode = document.getElementById('storeCode').value;
    if (!storeCode) {
        alert('请输入店铺编码');
        return;
    }
    
    const url = 'https://' + country + '/store/home?store_code=' + storeCode;
    chrome.tabs.create({ url: url });
    
    addToHistory('shein', storeCode, country, 'store');
    document.getElementById('storeCode').value = '';
    showHistory();
}

// 更新SHEIN站点选项
function updateSheinCountries() {
    const sheinCountries = [
        { value: 'us.shein.com', text: '🇺🇸 美国 (US)', keywords: '美国 us america united states' },
        { value: 'uk.shein.com', text: '🇬🇧 英国 (UK)', keywords: '英国 uk britain united kingdom 英国' },
        { value: 'de.shein.com', text: '🇩🇪 德国 (DE)', keywords: '德国 de germany deutschland' },
        { value: 'fr.shein.com', text: '🇫🇷 法国 (FR)', keywords: '法国 fr france' },
        { value: 'es.shein.com', text: '🇪🇸 西班牙 (ES)', keywords: '西班牙 es spain espana' },
        { value: 'it.shein.com', text: '🇮🇹 意大利 (IT)', keywords: '意大利 it italy italia' },
        { value: 'ca.shein.com', text: '🇨🇦 加拿大 (CA)', keywords: '加拿大 ca canada' },
        { value: 'au.shein.com', text: '🇦🇺 澳大利亚 (AU)', keywords: '澳大利亚 澳洲 au australia' },
        { value: 'jp.shein.com', text: '🇯🇵 日本 (JP)', keywords: '日本 jp japan' },
        { value: 'nl.shein.com', text: '🇳🇱 荷兰 (NL)', keywords: '荷兰 nl netherlands holland' },
        { value: 'be.shein.com', text: '🇧🇪 比利时 (BE)', keywords: '比利时 be belgium' },
        { value: 'at.shein.com', text: '🇦🇹 奥地利 (AT)', keywords: '奥地利 at austria' },
        { value: 'ch.shein.com', text: '🇨🇭 瑞士 (CH)', keywords: '瑞士 ch switzerland' },
        { value: 'se.shein.com', text: '🇸🇪 瑞典 (SE)', keywords: '瑞典 se sweden' },
        { value: 'no.shein.com', text: '🇳🇴 挪威 (NO)', keywords: '挪威 no norway' },
        { value: 'dk.shein.com', text: '🇩🇰 丹麦 (DK)', keywords: '丹麦 dk denmark' },
        { value: 'fi.shein.com', text: '🇫🇮 芬兰 (FI)', keywords: '芬兰 fi finland' },
        { value: 'ie.shein.com', text: '🇮🇪 爱尔兰 (IE)', keywords: '爱尔兰 ie ireland' },
        { value: 'pt.shein.com', text: '🇵🇹 葡萄牙 (PT)', keywords: '葡萄牙 pt portugal' },
        { value: 'gr.shein.com', text: '🇬🇷 希腊 (GR)', keywords: '希腊 gr greece' },
        { value: 'pl.shein.com', text: '🇵🇱 波兰 (PL)', keywords: '波兰 pl poland' },
        { value: 'cz.shein.com', text: '🇨🇿 捷克 (CZ)', keywords: '捷克 cz czech' },
        { value: 'hu.shein.com', text: '🇭🇺 匈牙利 (HU)', keywords: '匈牙利 hu hungary' },
        { value: 'mx.shein.com', text: '🇲🇽 墨西哥 (MX)', keywords: '墨西哥 mx mexico' },
        { value: 'br.shein.com', text: '🇧🇷 巴西 (BR)', keywords: '巴西 br brazil' },
        { value: 'ar.shein.com', text: '🇦🇷 阿根廷 (AR)', keywords: '阿根廷 ar argentina' },
        { value: 'cl.shein.com', text: '🇨🇱 智利 (CL)', keywords: '智利 cl chile' },
        { value: 'in.shein.com', text: '🇮🇳 印度 (IN)', keywords: '印度 in india' },
        { value: 'sg.shein.com', text: '🇸🇬 新加坡 (SG)', keywords: '新加坡 sg singapore' },
        { value: 'my.shein.com', text: '🇲🇾 马来西亚 (MY)', keywords: '马来西亚 my malaysia' },
        { value: 'th.shein.com', text: '🇹🇭 泰国 (TH)', keywords: '泰国 th thailand' },
        { value: 'id.shein.com', text: '🇮🇩 印尼 (ID)', keywords: '印尼 id indonesia' },
        { value: 'kr.shein.com', text: '🇰🇷 韩国 (KR)', keywords: '韩国 kr korea south' },
        { value: 'nz.shein.com', text: '🇳🇿 新西兰 (NZ)', keywords: '新西兰 nz zealand' },
        { value: 'za.shein.com', text: '🇿🇦 南非 (ZA)', keywords: '南非 za africa south' },
        { value: 'ae.shein.com', text: '🇦🇪 阿联酋 (AE)', keywords: '阿联酋 ae uae emirates' },
        { value: 'sa.shein.com', text: '🇸🇦 沙特 (SA)', keywords: '沙特 sa saudi arabia' },
        { value: 'tr.shein.com', text: '🇹🇷 土耳其 (TR)', keywords: '土耳其 tr turkey' },
        { value: 'il.shein.com', text: '🇮🇱 以色列 (IL)', keywords: '以色列 il israel' }
    ];
    
    currentCountries = sheinCountries;
    renderCountries(sheinCountries);
    updateCountryCount(sheinCountries.length, 'SHEIN');
}

// 更新Temu站点选项
function updateTemuCountries() {
    const temuCountries = [
        { value: 'www.temu.com', text: '🇺🇸 美国 (US)', keywords: '美国 us america united states' },
        { value: 'uk.temu.com', text: '🇬🇧 英国 (UK)', keywords: '英国 uk britain united kingdom' },
        { value: 'de.temu.com', text: '🇩🇪 德国 (DE)', keywords: '德国 de germany deutschland' },
        { value: 'fr.temu.com', text: '🇫🇷 法国 (FR)', keywords: '法国 fr france' },
        { value: 'es.temu.com', text: '🇪🇸 西班牙 (ES)', keywords: '西班牙 es spain espana' },
        { value: 'it.temu.com', text: '🇮🇹 意大利 (IT)', keywords: '意大利 it italy italia' },
        { value: 'ca.temu.com', text: '🇨🇦 加拿大 (CA)', keywords: '加拿大 ca canada' },
        { value: 'au.temu.com', text: '🇦🇺 澳大利亚 (AU)', keywords: '澳大利亚 澳洲 au australia' },
        { value: 'jp.temu.com', text: '🇯🇵 日本 (JP)', keywords: '日本 jp japan' },
        { value: 'nl.temu.com', text: '🇳🇱 荷兰 (NL)', keywords: '荷兰 nl netherlands holland' },
        { value: 'be.temu.com', text: '🇧🇪 比利时 (BE)', keywords: '比利时 be belgium' },
        { value: 'at.temu.com', text: '🇦🇹 奥地利 (AT)', keywords: '奥地利 at austria' },
        { value: 'ch.temu.com', text: '🇨🇭 瑞士 (CH)', keywords: '瑞士 ch switzerland' },
        { value: 'se.temu.com', text: '🇸🇪 瑞典 (SE)', keywords: '瑞典 se sweden' },
        { value: 'no.temu.com', text: '🇳🇴 挪威 (NO)', keywords: '挪威 no norway' },
        { value: 'dk.temu.com', text: '🇩🇰 丹麦 (DK)', keywords: '丹麦 dk denmark' },
        { value: 'fi.temu.com', text: '🇫🇮 芬兰 (FI)', keywords: '芬兰 fi finland' },
        { value: 'ie.temu.com', text: '🇮🇪 爱尔兰 (IE)', keywords: '爱尔兰 ie ireland' },
        { value: 'pt.temu.com', text: '🇵🇹 葡萄牙 (PT)', keywords: '葡萄牙 pt portugal' },
        { value: 'gr.temu.com', text: '🇬🇷 希腊 (GR)', keywords: '希腊 gr greece' },
        { value: 'pl.temu.com', text: '🇵🇱 波兰 (PL)', keywords: '波兰 pl poland' },
        { value: 'cz.temu.com', text: '🇨🇿 捷克 (CZ)', keywords: '捷克 cz czech' },
        { value: 'hu.temu.com', text: '🇭🇺 匈牙利 (HU)', keywords: '匈牙利 hu hungary' },
        { value: 'sk.temu.com', text: '🇸🇰 斯洛伐克 (SK)', keywords: '斯洛伐克 sk slovakia' },
        { value: 'si.temu.com', text: '🇸🇮 斯洛文尼亚 (SI)', keywords: '斯洛文尼亚 si slovenia' },
        { value: 'hr.temu.com', text: '🇭🇷 克罗地亚 (HR)', keywords: '克罗地亚 hr croatia' },
        { value: 'ro.temu.com', text: '🇷🇴 罗马尼亚 (RO)', keywords: '罗马尼亚 ro romania' },
        { value: 'bg.temu.com', text: '🇧🇬 保加利亚 (BG)', keywords: '保加利亚 bg bulgaria' },
        { value: 'ee.temu.com', text: '🇪🇪 爱沙尼亚 (EE)', keywords: '爱沙尼亚 ee estonia' },
        { value: 'lv.temu.com', text: '🇱🇻 拉脱维亚 (LV)', keywords: '拉脱维亚 lv latvia' },
        { value: 'lt.temu.com', text: '🇱🇹 立陶宛 (LT)', keywords: '立陶宛 lt lithuania' },
        { value: 'lu.temu.com', text: '🇱🇺 卢森堡 (LU)', keywords: '卢森堡 lu luxembourg' },
        { value: 'mt.temu.com', text: '🇲🇹 马耳他 (MT)', keywords: '马耳他 mt malta' },
        { value: 'kr.temu.com', text: '🇰🇷 韩国 (KR)', keywords: '韩国 kr korea south' },
        { value: 'sg.temu.com', text: '🇸🇬 新加坡 (SG)', keywords: '新加坡 sg singapore' },
        { value: 'my.temu.com', text: '🇲🇾 马来西亚 (MY)', keywords: '马来西亚 my malaysia' },
        { value: 'th.temu.com', text: '🇹🇭 泰国 (TH)', keywords: '泰国 th thailand' },
        { value: 'id.temu.com', text: '🇮🇩 印尼 (ID)', keywords: '印尼 id indonesia' },
        { value: 'in.temu.com', text: '🇮🇳 印度 (IN)', keywords: '印度 in india' },
        { value: 'nz.temu.com', text: '🇳🇿 新西兰 (NZ)', keywords: '新西兰 nz zealand' },
        { value: 'za.temu.com', text: '🇿🇦 南非 (ZA)', keywords: '南非 za africa south' },
        { value: 'mx.temu.com', text: '🇲🇽 墨西哥 (MX)', keywords: '墨西哥 mx mexico' },
        { value: 'ar.temu.com', text: '🇦🇷 阿根廷 (AR)', keywords: '阿根廷 ar argentina' },
        { value: 'cl.temu.com', text: '🇨🇱 智利 (CL)', keywords: '智利 cl chile' },
        { value: 'co.temu.com', text: '🇨🇴 哥伦比亚 (CO)', keywords: '哥伦比亚 co colombia' },
        { value: 'ru.temu.com', text: '🇷🇺 俄罗斯 (RU)', keywords: '俄罗斯 ru russia' },
        { value: 'www.temu.com/tr-en', text: '🇹🇷 土耳其 (TR)', keywords: '土耳其 tr turkey' },
        { value: 'ua.temu.com', text: '🇺🇦 乌克兰 (UA)', keywords: '乌克兰 ua ukraine' },
        { value: 'il.temu.com', text: '🇮🇱 以色列 (IL)', keywords: '以色列 il israel' },
        { value: 'ae.temu.com', text: '🇦🇪 阿联酋 (AE)', keywords: '阿联酋 ae uae emirates' }
    ];
    
    currentCountries = temuCountries;
    renderCountries(temuCountries);
    updateCountryCount(temuCountries.length, 'Temu');
}

// 添加历史记录
function addToHistory(platform, id, country, type) {
    const newRecord = {
        platform: platform,
        id: id,
        country: country,
        type: type,
        time: new Date().getTime()
    };
    
    // 移除重复的记录
    historyData = historyData.filter(function(item) {
        return !(item.platform === platform && item.id === id && item.country === country && item.type === type);
    });
    
    // 添加到开头
    historyData.unshift(newRecord);
    
    // 最多保存20条
    if (historyData.length > 20) {
        historyData = historyData.slice(0, 20);
    }
    
    // 保存到本地存储
    localStorage.setItem('crossborder_history', JSON.stringify(historyData));
}

// 加载历史记录
function loadHistory() {
    try {
        const saved = localStorage.getItem('crossborder_history');
        if (saved) {
            historyData = JSON.parse(saved);
        }
        showHistory();
    } catch (e) {
        historyData = [];
        showHistory();
    }
}

// 显示历史记录
function showHistory() {
    const historyList = document.getElementById('historyList');
    
    if (historyData.length === 0) {
        historyList.innerHTML = '<div style="text-align:center;padding:20px;color:#999;">暂无访问历史</div>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < historyData.length; i++) {
        const item = historyData[i];
        const platformName = item.platform === 'temu' ? 'Temu' : 'SHEIN';
        const platformIcon = item.platform === 'temu' ? '🛍️' : '👗';
        const typeName = '店铺'; // 只保留店铺类型
        const countryName = getCountryName(item.country, item.platform);
        const timeText = getTimeText(item.time);
        
        html += '<div style="border:1px solid #ddd;margin:5px 0;padding:10px;border-radius:5px;background:#f9f9f9;">'
             + '<div style="display:flex;justify-content:space-between;align-items:center;">'
             + '<div style="flex:1;">'
             + '<div><strong>' + platformIcon + ' ' + platformName + ' ' + typeName + ': ' + item.id + '</strong></div>'
             + '<div style="color:#666;font-size:12px;">' + countryName + '</div>'
             + '<div style="color:#999;font-size:11px;">' + timeText + '</div>'
             + '</div>'
             + '<button class="visit-btn" data-platform="' + item.platform + '" data-id="' + item.id + '" data-country="' + item.country + '" data-type="' + item.type + '" style="background:#4CAF50;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px;">访问</button>'
             + '</div>'
             + '</div>';
    }
    
    historyList.innerHTML = html;
}

// 从历史记录访问
function visitFromHistory(platform, id, country, type) {
    console.log('开始访问:', platform, '店铺', id, country);
    let url;
    
    if (platform === 'temu') {
        if (country === 'www.temu.com/tr-en') {
            // 土耳其站点使用特殊URL格式
            url = 'https://www.temu.com/tr-en/mall.html?mall_id=' + id;
        } else {
            // 其他国家使用标准格式
            url = 'https://' + country + '/mall.html?mall_id=' + id;
        }
    } else if (platform === 'shein') {
        url = 'https://' + country + '/store/home?store_code=' + id;
    }
    
    console.log('访问链接:', url);
    
    try {
        chrome.tabs.create({ url: url }, function(tab) {
            if (chrome.runtime.lastError) {
                console.error('Chrome API 错误:', chrome.runtime.lastError);
                alert('打开页面失败: ' + chrome.runtime.lastError.message);
            } else {
                console.log('成功打开页面:', tab.id);
            }
        });
    } catch (error) {
        console.error('访问失败:', error);
        alert('访问失败: ' + error.message);
    }
}

// 获取时间显示
function getTimeText(timestamp) {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    if (diff < 60000) {
        return '刚刚';
    } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    } else {
        return '较早';
    }
}

// 获取国家名称
function getCountryName(domain, platform) {
    if (platform === 'temu') {
        const temuCountries = {
            'www.temu.com': '🇺🇸 美国',
            'uk.temu.com': '🇬🇧 英国',
            'de.temu.com': '🇩🇪 德国',
            'fr.temu.com': '🇫🇷 法国',
            'es.temu.com': '🇪🇸 西班牙',
            'it.temu.com': '🇮🇹 意大利',
            'ca.temu.com': '🇨🇦 加拿大',
            'au.temu.com': '🇦🇺 澳大利亚',
            'jp.temu.com': '🇯🇵 日本',
            'nl.temu.com': '🇳🇱 荷兰',
            'be.temu.com': '🇧🇪 比利时',
            'at.temu.com': '🇦🇹 奥地利',
            'ch.temu.com': '🇨🇭 瑞士',
            'se.temu.com': '🇸🇪 瑞典',
            'no.temu.com': '🇳🇴 挪威',
            'dk.temu.com': '🇩🇰 丹麦',
            'fi.temu.com': '🇫🇮 芬兰',
            'ie.temu.com': '🇮🇪 爱尔兰',
            'pt.temu.com': '🇵🇹 葡萄牙',
            'gr.temu.com': '🇬🇷 希腊',
            'pl.temu.com': '🇵🇱 波兰',
            'cz.temu.com': '🇨🇿 捷克',
            'hu.temu.com': '🇭🇺 匈牙利',
            'kr.temu.com': '🇰🇷 韩国',
            'sg.temu.com': '🇸🇬 新加坡',
            'my.temu.com': '🇲🇾 马来西亚',
            'th.temu.com': '🇹🇭 泰国',
            'in.temu.com': '🇮🇳 印度',
            'mx.temu.com': '🇲🇽 墨西哥',
            'ar.temu.com': '🇦🇷 阿根廷',
            'cl.temu.com': '🇨🇱 智利',
            'ru.temu.com': '🇷🇺 俄罗斯',
            'www.temu.com/tr-en': '🇹🇷 土耳其',
        };
        return temuCountries[domain] || domain;
    } else if (platform === 'shein') {
        const sheinCountries = {
            'us.shein.com': '🇺🇸 美国',
            'uk.shein.com': '🇬🇧 英国',
            'de.shein.com': '🇩🇪 德国',
            'fr.shein.com': '🇫🇷 法国',
            'es.shein.com': '🇪🇸 西班牙',
            'it.shein.com': '🇮🇹 意大利',
            'ca.shein.com': '🇨🇦 加拿大',
            'au.shein.com': '🇦🇺 澳大利亚',
            'jp.shein.com': '🇯🇵 日本',
            'nl.shein.com': '🇳🇱 荷兰',
            'be.shein.com': '🇧🇪 比利时',
            'at.shein.com': '🇦🇹 奥地利',
            'ch.shein.com': '🇨🇭 瑞士',
            'se.shein.com': '🇸🇪 瑞典',
            'no.shein.com': '🇳🇴 挪威',
            'dk.shein.com': '🇩🇰 丹麦',
            'fi.shein.com': '🇫🇮 芬兰',
            'ie.shein.com': '🇮🇪 爱尔兰',
            'pt.shein.com': '🇵🇹 葡萄牙',
            'gr.shein.com': '🇬🇷 希腊',
            'pl.shein.com': '🇵🇱 波兰',
            'cz.shein.com': '🇨🇿 捷克',
            'hu.shein.com': '🇭🇺 匈牙利',
            'kr.shein.com': '🇰🇷 韩国',
            'sg.shein.com': '🇸🇬 新加坡',
            'my.shein.com': '🇲🇾 马来西亚',
            'th.shein.com': '🇹🇭 泰国',
            'in.shein.com': '🇮🇳 印度',
            'mx.shein.com': '🇲🇽 墨西哥',
            'br.shein.com': '🇧🇷 巴西',
            'ar.shein.com': '🇦🇷 阿根廷',
            'cl.shein.com': '🇨🇱 智利',
            'tr.shein.com': '🇹🇷 土耳其',
            'il.shein.com': '🇮🇱 以色列',
            'ae.shein.com': '🇦🇪 阿联酋',
            'sa.shein.com': '🇸🇦 沙特',
            'za.shein.com': '🇿🇦 南非',
            'nz.shein.com': '🇳🇿 新西兰',
            'id.shein.com': '🇮🇩 印尼'
        };
        return sheinCountries[domain] || domain;
    }
    return domain;
}

// 渲染国家选项
function renderCountries(countries) {
    const countrySelect = document.getElementById('country');
    let html = '';
    
    countries.forEach(function(country) {
        html += '<option value="' + country.value + '">' + country.text + '</option>';
    });
    
    countrySelect.innerHTML = html;
    
    // 如果有选项，默认选择第一个
    if (countries.length > 0) {
        countrySelect.selectedIndex = 0;
    }
}

// 更新国家计数信息
function updateCountryCount(count, platform) {
    const countryCount = document.getElementById('countryCount');
    if (countryCount) {
        countryCount.textContent = '共' + count + '个' + platform + '站点';
    }
}

// 获取当前平台
function getCurrentPlatform() {
    const platformSelect = document.getElementById('platform');
    return platformSelect.value === 'temu' ? 'Temu' : 'SHEIN';
}

// 显示帮助弹窗
function showHelpPopup() {
    const helpPopup = document.getElementById('helpPopup');
    const searchOverlay = document.getElementById('searchOverlay');
    
    searchOverlay.classList.add('show');
    helpPopup.classList.add('show');
}

// 隐藏帮助弹窗
function hideHelpPopup() {
    const helpPopup = document.getElementById('helpPopup');
    const searchOverlay = document.getElementById('searchOverlay');
    
    searchOverlay.classList.remove('show');
    helpPopup.classList.remove('show');
}

// 显示搜索弹窗
function showSearchPopup() {
    const searchPopup = document.getElementById('searchPopup');
    const searchOverlay = document.getElementById('searchOverlay');
    const countrySearch = document.getElementById('countrySearch');
    
    searchOverlay.classList.add('show');
    searchPopup.classList.add('show');
    
    // 清空搜索框并聚焦
    countrySearch.value = '';
    setTimeout(() => {
        countrySearch.focus();
    }, 100);
    
    // 显示所有国家
    filterCountriesInPopup('');
}

// 隐藏搜索弹窗
function hideSearchPopup() {
    const searchPopup = document.getElementById('searchPopup');
    const searchOverlay = document.getElementById('searchOverlay');
    
    searchOverlay.classList.remove('show');
    searchPopup.classList.remove('show');
}

// 在弹窗中过滤国家
function filterCountriesInPopup(searchTerm) {
    const searchResults = document.getElementById('searchResults');
    const searchCount = document.getElementById('searchCount');
    
    let filtered = currentCountries;
    
    if (searchTerm) {
        filtered = currentCountries.filter(function(country) {
            const searchString = (country.text + ' ' + country.keywords).toLowerCase();
            return searchString.includes(searchTerm);
        });
    }
    
    // 渲染搜索结果
    let html = '';
    filtered.forEach(function(country) {
        html += '<div class="search-result-item" data-value="' + country.value + '">' + country.text + '</div>';
    });
    
    searchResults.innerHTML = html;
    searchCount.textContent = '显示 ' + filtered.length + ' 个站点';
    
    // 绑定点击事件
    const resultItems = searchResults.querySelectorAll('.search-result-item');
    resultItems.forEach(function(item) {
        item.onclick = function() {
            const value = this.getAttribute('data-value');
            const countrySelect = document.getElementById('country');
            countrySelect.value = value;
            countrySelect.style.borderColor = '#667eea';
            hideSearchPopup();
        };
    });
}