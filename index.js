/* eslint-disable */
var mockServerClient = (function () {
    'use strict';
  
    // 生成随机字符串，能被排序，用于作为标示数据的id
    function _randomName(len) {
        len = len || 23;
        var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = chars.length;
        var str = '';
        for (var i = 0; i < len; i++) {
            str += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return new Date().getTime() + str;
    }
    /*
    处理url
    移除url前面的targetOriginal
    @params originUrl string 要处理的url
    @params targetOriginal array 要被处理的url前面那一串
    @return string 处理后的url
    */
    function MOCKServerGetCgiPath(originUrl, targetOriginal) {
        if (!targetOriginal) return originUrl;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;
  
        try {
            for (var _iterator = targetOriginal[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;
  
                if (originUrl.indexOf(item) >= 0) {
                    return originUrl.replace(item, '');
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
  
        return originUrl;
    }
  
    /*
    取get请求中的参数
    @params originUrl string 请求url
    @return object 请求参数
    */
    function MOCKServerGetUrlQuery(originUrlSearch) {
        try {
            var queryList = originUrlSearch.split('&');
            var queryObj = Object.create(null);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;
  
            try {
                for (var _iterator2 = queryList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var queryListItem = _step2.value;
  
                    var targetQueryItem = queryListItem.replace('=', '&&&');
                    var queryItemList = targetQueryItem.split('&&&');
                    queryObj[queryItemList[0]] = queryItemList[1];
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
  
            return queryObj;
        } catch (e) {
            return {};
        }
    }
  
    /*
    取url中指定的query值
    @params name string 取的url参数名
    @return string 返回对应的query值
    */
    function MOCKServerGetUrlQueryValue(name) {
        if (location) {
            var queryObj = MOCKServerGetUrlQuery(location.search.split('?')[1]);
            return queryObj[name];
        }
        return '';
    }
  
    /*
    函数前插桩
    */
    function _witHookBefore(originalFn, hookFn) {
        return function () {
            hookFn.apply(this, arguments);
            return originalFn.apply(this, arguments);
        };
    }
  
    /*
    函数后插桩
    */
    function _witHookAfter(originalFn, hookFn) {
        return function () {
            var output = originalFn.apply(this, arguments);
            hookFn.apply(this, arguments);
            return output;
        };
    }
  
    /*
    取cookie值
    */
    function MOCKServerGetCookie(name) {
        var cookies = document.cookie;
        var list = cookies.split('; '); // 解析出名/值对列表
  
        for (var i = 0; i < list.length; i++) {
            var arr = list[i].split('='); // 解析出名和值
            if (arr[0] == name) {
                return decodeURIComponent(arr[1]); // 对cookie值解码
            }
        }
        return '';
    }
  
    /*
    生成时间 年月日时分秒
    */
    Date.prototype.Format = function (fmt) {
        // author: meizz
        var o = {
            "M+": this.getMonth() + 1, // 月份
            "d+": this.getDate(), // 日
            "h+": this.getHours(), // 小时
            "m+": this.getMinutes(), // 分
            "s+": this.getSeconds(), // 秒
            "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
            "S": this.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }return fmt;
    };
  
    function MOCKServerAjax(options) {
        options = options || {};
        options.type = options.type || 'GET';
        options.type = options.type.toUpperCase();
        options.dataType = options.dataType || "json";
        var params = formatParams(options.data);
  
        //创建 - 非IE6 - 第一步
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else {
            //IE6及其以下版本浏览器
            var xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
  
        //接收 - 第三步
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                /*if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }*/
                // 只返回200
                if (status === 200) {
                    try {
                        options.success && options.success(JSON.parse(xhr.responseText), xhr.responseXML);
                    } catch (err) {
                        options.success && options.success(err, xhr.responseXML);
                    }
                } else {
                    options.fail && options.fail(status);
                }
            }
        };
  
        //连接 和 发送 - 第二步
        if (options.type == "GET") {
            xhr.open("GET", options.url + "?" + params, true);
            xhr.withCredentials = true; // 跨域 带上cookie
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, true);
            //设置表单提交时的内容类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.withCredentials = true; // 跨域 带上cookie
            xhr.send(params);
        }
    }
    //格式化参数
    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }
        return arr.join("&");
    }
  
    /*
    https://juejin.im/post/59663eaa6fb9a06ba73d4c35
    author: icyfish
    */
  
    /*
    简单来，能让字符串转dom即可
    by gaby
    */
    function _parseDom(domString) {
        var objE = document.createElement("div");
        var template = '<div class="child">' + domString + '</div>';
        objE.innerHTML = template;
  
        return objE.firstChild;
    }
    var TemplateEngine = function TemplateEngine(html, options) {
        var re = /<%([^%>]+)?%>/g,
            reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
            code = 'var r=[];\n',
            cursor = 0,
            match;
        var add = function add(line, js) {
            js ? code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n' : code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '';
            return add;
        };
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code += 'return r.join("");';
        var element = _parseDom(new Function(code.replace(/[\r\t\n]/g, '')).apply(options));
        document.body.appendChild(element);
  
        return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
    };
  
    var MOCKServerXMLHttpRequestOriginConfigs = {};
  
    /*
    获取公共配置
    */
    function MOCKServerGetConfigs(configs) {
      MOCKServerXMLHttpRequestOriginConfigs = configs;
    }
  
    /*
    提前录制直出数据
    */
    function MOCKServerStraightOut() {
      if (MOCKServerXMLHttpRequestOriginConfigs.actionType === 'record' && MOCKServerXMLHttpRequestOriginConfigs.configsGetStraightOut) {
        // 是录制，且需要拿直出参数
        if (!MOCKServerXMLHttpRequestOriginConfigs.configsRtx) {
          // 需要有设置了rtx
          return;
        }
        var reqData = Object.assign(MOCKServerGetUrlQuery(MOCKServerXMLHttpRequestOriginConfigs.configsGetStraightOut), MOCKServerGetUrlQuery(location.href.split('?')[1]));
        MOCKServerAjaxCommon(location.href.split('?')[0], reqData, 'GET');
      }
    }
  
    /*获取recordid*/
    function MOCKServerGetRecordid() {
      return new Promise(function (resolve, reject) {
        // 判断是否有recordid
        // 无recordid，去取，且存localstorage（跨页面用）和缓存（当前页面用）
        // if (!localStorage.getItem('recordid')) { 
        // 走请求，拿recordid
        MOCKServerAjaxCommon(MOCKServerXMLHttpRequestOriginConfigs.configsRecordidOriginal, {
          rtx: MOCKServerXMLHttpRequestOriginConfigs.configsRtx,
          project: JSON.stringify({
            path: MOCKServerXMLHttpRequestOriginConfigs.configsTarget
          })
        }, 'GET').then(function (resp) {
          if (resp && resp.base_resp && resp.base_resp.ret === 0) {
            resolve({
              recordid: resp.result.recordid
            });
            localStorage.setItem('recordid', resp.result.recordid);
          } else {
            reject(resp);
          }
        });
        /*} else { // 有recordid跳过，如果超时，再下一个请求再报
          resolve({
            recordid: localStorage.getItem('recordid')
          })
        }*/
      });
    }
  
    /*
    网页通用请求
    */
    function MOCKServerAjaxCommon(targetUrl, reqData, method) {
      return new Promise(function (resolve, reject) {
        if (targetUrl.indexOf('oa.m.tencent.com') > 0) {
          // 移动网关写死GET
          method = 'GET';
        }
        MOCKServerAjax({
          url: targetUrl,
          type: method, //请求方式
          data: reqData, //请求参数
          dataType: 'json',
          success: function success(response, xml) {
            // 此处放成功后执行的代码
            resolve(response, xml);
          },
          fail: function fail(status) {
            // 此处放失败后执行的代码
            // reject(status)
          }
        });
      });
    }
  
    function XMLHttpRequestNew() {
      // 劫持后的XMLHttpRequest
      var __XMLHttpRequest = window.XMLHttpRequest;
      __XMLHttpRequest.prototype.open = _witHookAfter(__XMLHttpRequest.prototype.open, function (method, url) {
        var _this = this;
  
        this._url = url;
        this._method = method;
        this.addEventListener('readystatechange', function () {
          _this._readyState = _this.readyState;
          _this._status = _this.status;
          _this._statusText = _this.statusText;
          _this._response = _this.response;
          _this._responseURL = _this.responseURL;
          _this._responseType = _this.responseType;
          _this._responseXML = _this.responseXML;
          _this._responseText = _this.responseText;
          _this._onreadystatechange();
        });
      });
  
      __XMLHttpRequest.prototype._onreadystatechange = function () {
        if (this._readyState === 4 && this._url.indexOf(MOCKServerXMLHttpRequestOriginConfigs.requestTargetOriginal) < 0 && MOCKServerXMLHttpRequestOriginConfigs.actionType === 'record') {
          // 进入录制
          if (!MOCKServerXMLHttpRequestOriginConfigs.configsRtx) {
            return;
          }
          var testcase = JSON.stringify({
            path: MOCKServerXMLHttpRequestOriginConfigs.configsFrom + '__' + _randomName(5),
            testCase: this._response
          });
          MOCKServerAjaxCommon(MOCKServerXMLHttpRequestOriginConfigs.requestRecordTargetOriginal, {
            rtx: MOCKServerXMLHttpRequestOriginConfigs.configsRtx,
            date: Date.parse(new Date()),
            statusCode: this._status,
            contentType: this.getResponseHeader('content-type'),
            method: this._method,
            from: MOCKServerXMLHttpRequestOriginConfigs.configsFrom,
            recordid: MOCKServerXMLHttpRequestOriginConfigs.recordid || localStorage.getItem('recordid'),
            project: JSON.stringify({
              path: MOCKServerXMLHttpRequestOriginConfigs.configsTarget
            }),
  
            cgi: JSON.stringify({
              path: MOCKServerGetCgiPath(this._url.split('?')[0], MOCKServerXMLHttpRequestOriginConfigs.configsOriginal)
            }),
            // reqdata: JSON.stringify(_requestItem.reqData),
            reqdata: JSON.stringify(this._reqData),
            testcase: testcase
          }, 'POST').then(function (res) {
            if (res.base_resp.ret !== 0) {
              TemplateEngine(toast('custom', res.base_resp.ret_msg));
              setTimeout(function () {
                MOCKServerRemoveTags('MOCKServerToast');
              }, 2000);
            }
          });
        }
      };
  
      __XMLHttpRequest.prototype.send = _witHookBefore(__XMLHttpRequest.prototype.send, function (requestData) {
        var urlSearch = this._url.split('?')[1];
        this._reqData = {
          body: arguments[0] ? MOCKServerGetUrlQuery(arguments[0]) : {},
          query: urlSearch ? MOCKServerGetUrlQuery(urlSearch) : {}
        };
      });
      console.log('XMLHttpRequestNew end');
      // 
      // return KidnapXMLHttpRequest
    }
  
    var _toastStyle = 'position: fixed;\nz-index: 5000;\nwidth: 120px;\nheight: 120px;\ntop: 40%;\nleft: 50%;\n-webkit-transform: translate(-50%,-50%);\ntransform: translate(-50%,-50%);\ntext-align: center;\nborder-radius: 5px;\ncolor: rgba(255,255,255,0.9);\ndisplay: -webkit-box;\ndisplay: -webkit-flex;\ndisplay: flex;\n-webkit-box-orient: vertical;\n-webkit-box-direction: normal;\n-webkit-flex-direction: column;\nflex-direction: column;\n-webkit-box-align: center;\n-webkit-align-items: center;\nalign-items: center;\n-webkit-box-pack: center;\n-webkit-justify-content: center;\njustify-content: center;\nbackground-color: #4c4c4c;';
  
    var _toastInfoStyle = 'font-size: 14px;';
  
    var _toastInnerIcon = 'display: block;\ncolor: rgba(255,255,255,0.9);\nwidth: 55px;\nheight: 55px;';
  
    var successSubmitToast = '<div class="weui-toast" id="MOCKServerToast" style="' + _toastStyle + '">\n    <i class="weui-icon-success-no-circle weui-icon_toast" style="' + _toastInnerIcon + '\n        -webkit-mask-image: url(data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M8.657%2018.435L3%2012.778l1.414-1.414%204.95%204.95L20.678%205l1.414%201.414-12.02%2012.021a1%201%200%2001-1.415%200z%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E);\n        background-color: currentColor;\n        -webkit-mask-position: 50% 50%;\n        mask-position: 50% 50%;\n        -webkit-mask-repeat: no-repeat;\n        -webkit-mask-size: 100%;\n        mask-size: 100%;"></i>\n    <p class="weui-toast__content" style="' + _toastInfoStyle + '">\u672C\u6B21\u5F55\u5236\u7ED3\u675F</p>\n</div>';
  
    var successCancelToast = '<div class="weui-toast" id="MOCKServerToast" style="' + _toastStyle + '">\n    <i class="weui-icon-success-no-circle weui-icon_toast" style="' + _toastInnerIcon + '\n        -webkit-mask-image: url(data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M8.657%2018.435L3%2012.778l1.414-1.414%204.95%204.95L20.678%205l1.414%201.414-12.02%2012.021a1%201%200%2001-1.415%200z%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E);\n        background-color: currentColor;\n        -webkit-mask-position: 50% 50%;\n        mask-position: 50% 50%;\n        -webkit-mask-repeat: no-repeat;\n        -webkit-mask-size: 100%;\n        mask-size: 100%;"></i>\n    <p class="weui-toast__content" style="' + _toastInfoStyle + '">\u672C\u6B21\u5F55\u5236\u5DF2\u53D6\u6D88</p>\n</div>';
  
    function _errorToast(info) {
        return '<div class="weui-toast" id="MOCKServerToast" style="' + _toastStyle + '">\n        <i class="weui-icon-success-no-circle weui-icon_toast" style="\n            -webkit-mask-image: url(data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12%2022C6.477%2022%202%2017.523%202%2012S6.477%202%2012%202s10%204.477%2010%2010-4.477%2010-10%2010zm-.763-15.864l.11%207.596h1.305l.11-7.596h-1.525zm.759%2010.967c.512%200%20.902-.383.902-.882%200-.5-.39-.882-.902-.882a.878.878%200%2000-.896.882c0%20.499.396.882.896.882z%22%2F%3E%3C%2Fsvg%3E);\n        "></i>\n        <p class="weui-toast__content" style="' + _toastInfoStyle + '">' + info + '</p>\n    </div>';
    }
  
    function toast$1(type, info) {
        switch (type) {
            case 'successSubmitToast':
                return successSubmitToast;
  
            case 'successCancel':
                return successCancelToast;
  
            case 'custom':
                return _errorToast(info);
  
            case 'error':
                return _errorToast('无权限');
  
            case 'timeout':
                return _errorToast('录制超时');
        }
    }
  
    // 通用弹窗
  
    function recordSubmitDialog(recordid) {
        return "<style type=\"text/css\">::-webkit-input-placeholder { color: rgba(0, 0, 0, 0.5);}</style><div class=\"weui-mask\" id=\"mockserverDialogMask\" style=\"position: fixed;\n    z-index: 1000;\n    top: 0;\n    right: 0;\n    left: 0;\n    bottom: 0;\n    background: rgba(0,0,0,0.6);\"></div>\n    <div class=\"weui-dialog\" id=\"mockserverDialog\" style=\"position: fixed;\n        z-index: 5000;\n        top: 50%;\n        left: 16px;\n        right: 16px;\n        -webkit-transform: translate(0,-50%);\n        transform: translate(0,-50%);\n        background-color: #fff;\n        text-align: center;\n        border-radius: 12px;\n        overflow: hidden;\n        display: -webkit-box;\n        display: -webkit-flex;\n        display: flex;\n        -webkit-flex-direction: column;\n        -webkit-box-orient: vertical;\n        -webkit-box-direction: normal;\n        flex-direction: column;\n        max-height: 90%;\n        width: 320px;\n        margin: 0 auto;\">\n        <div class=\"weui-dialog__hd\" style=\"padding: 32px 24px 16px;color:rgba(0,0,0,0.9)\"><strong class=\"weui-dialog__title\" style=\"font-weight: 700;\n        font-size: 17px;\n        line-height: 1.4;\">\u5F55\u5236\u7ED3\u675F</strong></div>\n        <div class=\"weui-dialog__bd\" style=\"overflow-y: auto;\n            -webkit-overflow-scrolling: touch;\n            padding: 0 24px;\n            margin-bottom: 32px;\n            font-size: 17px;\n            line-height: 1.4;\n            word-wrap: break-word;\n            -webkit-hyphens: auto;\n            hyphens: auto;\n            color: rgba(0,0,0,0.5);\">\n            <div class=\"weui-cell weui-cell_active\" style=\"color: rgba(0,0,0,0.9);\n                padding: 16px 0;\n                position: relative;\n                display: -webkit-box;\n                display: -webkit-flex;\n                display: flex;\n                -webkit-box-align: center;\n                -webkit-align-items: center;\n                align-items: center;\">\n                <div class=\"weui-cell__hd\" style=\"padding-right: 16px;\"><label class=\"weui-label\" style=\"width: 4.1em;\n                display: block;\n                max-width: 5em;\n                margin-right: 8px;\">recordid</label></div>\n                <div class=\"weui-cell__bd\" style=\"-webkit-box-flex: 1;\n                    -webkit-flex: 1;\n                    flex: 1;word-break: break-all;text-align:right;\">" + recordid + "</div>\n            </div>  \n            <div class=\"weui-cell weui-cell_active\" style=\"color: rgba(0,0,0,0.9);\n                padding: 16px 0;\n                position: relative;\n                display: -webkit-box;\n                display: -webkit-flex;\n                display: flex;\n                -webkit-box-align: center;\n                -webkit-align-items: center;\n                align-items: center;\">\n                <div class=\"weui-cell__hd\" style=\"padding-right: 16px;\"><label class=\"weui-label\" style=\"width: 4.1em;\n                display: block;\n                max-width: 5em;\n                margin-right: 8px;\">\u5F55\u5236id</label></div>\n                <div class=\"weui-cell__bd\" style=\"-webkit-box-flex: 1;\n                    -webkit-flex: 1;\n                    flex: 1;\">\n                    <input id=\"MOCKServerRecordPath\" class=\"weui-input\" placeholder=\"\u8981\u6C42\u5168\u5B57\u6BCD\" style=\"width: 100%;\n                        border: 0;\n                        outline: 0;\n                        -webkit-appearance: none;\n                        background-color: transparent;\n                        font-size: inherit;\n                        color: inherit;\n                        height: 1.41176471em;\n                        line-height: 1.41176471;\n                        -webkit-tap-highlight-color: rgba(0,0,0,0);\n                        text-align: right;\"/>\n                </div>\n            </div>\n            <div class=\"weui-cell weui-cell_active\" style=\"color: rgba(0,0,0,0.9);\n                padding: 16px 0;\n                position: relative;\n                display: -webkit-box;\n                display: -webkit-flex;\n                display: flex;\n                -webkit-box-align: center;\n                -webkit-align-items: center;\n                align-items: center;\">\n                <div class=\"weui-cell__hd\" style=\"padding-right: 16px;\"><label class=\"weui-label\" style=\"width: 4.1em;\n                display: block;\n                max-width: 5em;\n                margin-right: 8px;\">\u63CF\u8FF0</label></div>\n                <div class=\"weui-cell__bd\" style=\"-webkit-box-flex: 1;\n                    -webkit-flex: 1;\n                    flex: 1;\">\n                    <input id=\"MOCKServerRecordDesc\" class=\"weui-input\" placeholder=\"\u586B\u5199\u672C\u6B21\u5F55\u5236\u7684\u63CF\u8FF0\" style=\"width: 100%;\n                        border: 0;\n                        outline: 0;\n                        -webkit-appearance: none;\n                        background-color: transparent;\n                        font-size: inherit;\n                        color: inherit;\n                        height: 1.41176471em;\n                        line-height: 1.41176471;\n                        -webkit-tap-highlight-color: rgba(0,0,0,0);\n                        text-align: right;\"/>\n                </div>\n            </div>    \n        </div>\n        <div class=\"weui-dialog__ft\" style=\"position: relative;\n            line-height: 56px;\n            min-height: 56px;\n            font-size: 17px;\n            display: -webkit-box;\n            display: -webkit-flex;\n            display: flex;\n            border-top: 1px solid rgba(0,0,0,0.1)\">\n            <a href=\"javascript:\" class=\"weui-dialog__btn weui-dialog__btn_default\" style=\"display: block;\n                -webkit-box-flex: 1;\n                -webkit-flex: 1;\n                flex: 1;\n                color: #fa5151;\n                font-weight: 700;\n                text-decoration: none;\n                -webkit-tap-highlight-color: rgba(0,0,0,0);\n                position: relative;\n                border-right: 1px solid rgba(0,0,0,0.1)\"\n                id=\"MOCKServerRecordCancelBtn\">\u53D6\u6D88\u672C\u6B21\u5F55\u5236</a>\n            <a href=\"javascript:\" class=\"weui-dialog__btn weui-dialog__btn_primary\" style=\"display: block;\n                -webkit-box-flex: 1;\n                -webkit-flex: 1;\n                flex: 1;\n                color: #576b95;\n                font-weight: 700;\n                text-decoration: none;\n                -webkit-tap-highlight-color: rgba(0,0,0,0);\n                position: relative;\"\n                id=\"MOCKServerRecordSubmitBtn\">\u63D0\u4EA4</a>\n        </div>\n    </div>";
    }
  
    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
  
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
    var MOCKServerConfigs = void 0;
  
    /*
    初始化配置
    环境：
    网页、小程序
  
    网页
    pc、移动端
  
    小程序
    （普通小程序、插件小程序 todo 另外多配一个东西）
    */
  
    var MOCKServerNormalizedConfigs = function () {
      function MOCKServerNormalizedConfigs() {
        _classCallCheck(this, MOCKServerNormalizedConfigs);
        console.log('MOCKServerNormalizedConfigs class');
        this._key = 'mock server';
        // for test 'https://mpdev.oa.com/mockserver/mockservercgi-bin/'
        // this._targetOriginal = 'http://10.9.165.153:8082/mockservercgi-bin/'
        // pc 有ioa的域名
        // this._targetOriginal = 'https://mpdev.oa.com/mockserver/mockservercgi-bin/'
        // 统一用mptest的域名
        // this._targetOriginal = 'https://mptest.weixin.qq.com/mockserver/mockservercgi-bin/'
        // 本地测试
        this._targetOriginal = 'http://mptest.weixin.qq.com:8082/mockservercgi-bin/';
        // this._targetOriginal = 'http://localhost:8082/mockservercgi-bin/';
        // 移动端无ioa的域名
        this._targetOriginalMobile = 'https://oa.m.tencent.com/an:' + (MOCKServerConfigs.key || 'mockServerGate') + '/mockserver/mockservercgi-bin/';
        // this._targetOriginalMobile = this._targetOriginal
  
        this.configsOriginal = MOCKServerConfigs.original; // 最终对外的 目标url
        this.configsGetStraightOut = MOCKServerConfigs.getStraightOut; // 获取直出参数
        this.key = ''; // wx login 换回来的code，换回来的移动网关key
        this.rtx = ''; // 用户rtx
        this.configsTarget = '';
        this.configsType = ''; // todo 允许外部接口设置
        this.configsRtx = ''; // todo 允许外部接口设置
        this.configsFrom = '';
        this.configsKey = ''; // 用于移动网关，通常不是小程序都不用改变
        this.configsClientType = ''; // 网页、小程序
        this.configsIsPc = true; // 根据能否ping通mpdev.oa.com来判断是pc还是移动端
        this.gateKey = ''; // 移动网关的key
        this.requestTargetOriginal = '';
        this.requestRedirectTargetOriginal = '';
        this.requestRecordTargetOriginal = '';
        this.requestPlayTargetOriginal = '';
        this.recordid = '';
  
        this._initCheckConfigs();
        this._initClientType();
        this.gateKey = MOCKServerConfigs.key || 'mockServerGate';
        this._initTargetOriginal();
        // this._getRequestOptions() 考虑使用场景来拿参数
      }
      // 初始化，校验配置合法性
  
  
      _createClass(MOCKServerNormalizedConfigs, [{
        key: '_initCheckConfigs',
        value: function _initCheckConfigs() {
          this.configsTarget = MOCKServerConfigs.target;
          this.configsType = MOCKServerGetUrlQueryValue('mockServerActionType') || MOCKServerGetCookie('mockServerActionType') || MOCKServerConfigs.type;
          this.configsRtx = MOCKServerConfigs.rtx;
          this.configsFrom = MOCKServerConfigs.from || 'external';
        }
      }, {
        key: '_initClientType',
        value: function _initClientType() {
          try {
            if (typeof wx !== 'undefined') {
              // 小程序
              var systemInfoRes = wx.getSystemInfoSync();
              if (systemInfoRes.platform === 'devtools') this.configsClientType = 'devtools';else {
                // 判断是否是 真机小程序
                this.configsClientType = 'miniprogram';
              }
              // 判断是否有设置key
              if (MOCKServerConfigs.key && typeof MOCKServerConfigs.target === 'string') {
                this.configsKey = MOCKServerConfigs.key;
              }
            } else {
              // 网页
              this.configsClientType = 'webpage';
              // 判断是否是pc
            }
          } catch (e) {
            this.configsClientType = 'webpage';
          }
        }
        // 重设请求链接
  
      }, {
        key: '_initTargetOriginal',
        value: function _initTargetOriginal() {
          // 网页 且 pc端，或 模拟器
          this.requestTargetOriginal = this._targetOriginal;
          this.requestRedirectTargetOriginal = this._targetOriginal + 'offerTestCase/' + this.configsTarget + '/';
          this.requestRecordTargetOriginal = this._targetOriginal + 'external/addRecord'; // 录制
          this.requestRecordSubmitOriginal = this._targetOriginal + 'external/recordSubmit'; // 录制
          this.requestRecordCancelOriginal = this._targetOriginal + 'external/recordCancel'; // 取消录制
          this.requestRecordPing = this._targetOriginal + 'external/recordPing'; // 录制ping
          this.requestPlayTargetOriginal = this._targetOriginal + 'offerTestCase/' + this.configsTarget + '/'; // 播发
          this.configsRecordidOriginal = this._targetOriginal + 'external/getRecordid'; // 获取recordid
        }
        // todo 重新wx login
  
      }, {
        key: 'setItem',
  
        // set 特定字段
        value: function setItem(prop, value) {
          this[prop] = value;
        }
      }, {
        key: 'all',
        get: function get() {
          return {
            configsOriginal: this.configsOriginal,
            configsTarget: this.configsTarget,
            configsType: this.configsType,
            configsRtx: this.configsRtx,
            configsFrom: this.configsFrom,
            configsKey: this.configsKey,
            configsGetStraightOut: this.configsGetStraightOut,
            configsClientType: this.configsClientType,
            configsIsPc: this.configsIsPc,
            configsRecordidOriginal: this.configsRecordidOriginal,
            requestTargetOriginal: this.requestTargetOriginal,
            requestRedirectTargetOriginal: this.requestRedirectTargetOriginal,
            requestRecordTargetOriginal: this.requestRecordTargetOriginal,
            requestRecordSubmitOriginal: this.requestRecordSubmitOriginal,
            requestRecordCancelOriginal: this.requestRecordCancelOriginal,
            requestRecordPing: this.requestRecordPing,
            requestPlayTargetOriginal: this.requestPlayTargetOriginal,
            recordid: this.recordid
          };
        }
      }]);
  
      return MOCKServerNormalizedConfigs;
    }();
  
    var MOCKServerFetchedConfigs = void 0;
  
    // 劫持web网页
    function MOCKServerKidnapWebpage() {
      // 初始化 window的XMLHttpRequest
      XMLHttpRequestNew();
  
      // 录制直出数据
      MOCKServerStraightOut();
    }
  
    // 清除所有tag
    function MOCKServerRemoveTags$1(targetId) {
      var idObject = document.getElementById(targetId);
      if (idObject != null) idObject.parentNode.removeChild(idObject);
    }
  
    var MOCKServerIsDomReady = 0;
    window.onload = function () {
      console.log('MOCKServerIsDomReady: ' + MOCKServerIsDomReady);
      MOCKServerIsDomReady = 1;
    };
    /*
    业务页面上的 tag 定义
    @params string status 状态 'success' 成功、'targeterror' 项目名称没配置、'rtxerror' rtx没配置
    @recordid string 录制id
    */
    function MOCKServerTag(status, recrodid) {
      if (!MOCKServerIsDomReady) {
        setTimeout(function () {
          MOCKServerTag(status, recrodid);
        }, 200);
        return;
      }
      // 出现新tag前，先移除旧的
      MOCKServerRemoveTags$1('mockservertag');
      var MOCKServerTagEle = document.createElement('div');
      MOCKServerTagEle.style.fontSize = '14px';
      MOCKServerTagEle.style.position = 'fixed';
      MOCKServerTagEle.style.padding = '0 8px';
      MOCKServerTagEle.style.top = '16px';
      MOCKServerTagEle.style.left = '16px';
      MOCKServerTagEle.style.lineHeight = '28px';
      MOCKServerTagEle.style.borderRadius = '4px';
      MOCKServerTagEle.style.backgroundColor = '#ff4747';
      MOCKServerTagEle.style.color = 'rgba(255, 255, 255, 0.9)';
      MOCKServerTagEle.style.cursor = 'pointer';
      MOCKServerTagEle.style.zIndex = '1000';
  
      var MOCKServerGetFirstChid = document.body.firstChild; //得到页面的第一个元素
      document.body.insertBefore(MOCKServerTagEle, MOCKServerGetFirstChid);
      var MOCKServerTagDragging = false;
      var MOCKServerTagLeft = 0,
          MOCKServerTagTop = 0;
      switch (status) {
        case 'success':
          console.log('\u672C\u6B21\u5F55\u5236id\u4E3A\uFF1A' + recrodid);
          MOCKServerTagEle.innerHTML = '\u5F55\u5236\u4E2D\u3002<br/><a id="mockservertagEnd" href="javascript:;">\u7ED3\u675F\u5F55\u5236</a> <a id="mockservertagCancel" href="javascript:;">\u53D6\u6D88\u5F55\u5236</a>';
          MOCKServerTagEle.id = 'mockservertag'; // 只有初始化成功，才可以点击结束录制
          document.body.insertBefore(MOCKServerTagEle, MOCKServerGetFirstChid);
          /*
            监听录制中tag
            被点击
          */
          document.getElementById('mockservertagEnd').addEventListener('click', MOCKServerReadyToSubmit);
          document.getElementById('mockservertagCancel').addEventListener('click', MOCKServerCancelRecord);
          break;
  
        case 'readyToRecord':
          MOCKServerTagEle.innerHTML = '<a id="mockservertagStart" href="javascript:;">\u70B9\u6211\u5F00\u59CB\u672C\u6B21\u5F55\u5236</a>';
          MOCKServerTagEle.id = 'mockservertag'; // 只有初始化成功，才可以点击结束录制
          document.body.insertBefore(MOCKServerTagEle, MOCKServerGetFirstChid);
          document.getElementById('mockservertagStart').addEventListener('click', MOCKServerReadyToRecord);
          break;
  
        case 'rtxerror':
          // document.body.appendChild(MOCKServerTagRecordFail);
          MOCKServerTagEle.innerText = '录制失败，mockServerClient中的rtx参数不能为空';
          document.body.insertBefore(MOCKServerTagEle, MOCKServerGetFirstChid);
          break;
  
        case 'targeterror':
          MOCKServerTagEle.innerText = '录制失败，mockServerClient中的target参数不能为空';
          document.body.insertBefore(MOCKServerTagEle, MOCKServerGetFirstChid);
          break;
  
        case 'cancelCurrentRecord':
          MOCKServerTagEle.innerText = '本次录制已取消。刷新当前页面或退出从进新业务，可开始新的录制';
          document.body.insertBefore(MOCKServerTagEle, MOCKServerGetFirstChid);
          break;
  
        case 'endCurrentRecord':
          MOCKServerTagEle.innerText = '本次录制已结束。刷新当前页面或退出从进新业务，可开始新的录制';
          document.body.insertBefore(MOCKServerTagEle, MOCKServerGetFirstChid);
          break;
      }
  
      //监听鼠标按下事件
      MOCKServerTagEle.addEventListener('mousedown', function (e) {
        // if (e.target == moveElem) {
  
        MOCKServerTagDragging = true; //激活拖拽状态
        console.log('e');
        console.log(e);
        console.log('this');
        console.log(this);
        var moveElemRect = this.getBoundingClientRect();
        MOCKServerTagLeft = e.clientX - moveElemRect.left; //鼠标按下时和选中元素的坐标偏移:x坐标
        MOCKServerTagTop = e.clientY - moveElemRect.top; //鼠标按下时和选中元素的坐标偏移:y坐标
        // }
      });
  
      //监听鼠标放开事件
      MOCKServerTagEle.addEventListener('mouseup', function (e) {
        MOCKServerTagDragging = false;
      });
  
      //监听鼠标移动事件
      MOCKServerTagEle.addEventListener('mousemove', function (e) {
        if (MOCKServerTagDragging) {
          var moveX = e.clientX - MOCKServerTagLeft,
              moveY = e.clientY - MOCKServerTagTop;
  
          MOCKServerTagEle.style.left = moveX + 'px';
          MOCKServerTagEle.style.top = moveY + 'px';
        }
      });
    }
  
    /*
    准备提交数据
    */
    function MOCKServerReadyToSubmit() {
      TemplateEngine(recordSubmitDialog(MOCKServerRecordid));
      document.getElementById('MOCKServerRecordDesc').addEventListener('change', function (e) {
        MOCKServerRecordDesc = e.target.value;
      });
      document.getElementById('MOCKServerRecordPath').addEventListener('change', function (e) {
        MOCKServerRecordPath = e.target.value;
      });
      document.getElementById('MOCKServerRecordCancelBtn').addEventListener('click', MOCKServerCancelRecord);
      document.getElementById('MOCKServerRecordSubmitBtn').addEventListener('click', MOCKServerSubmit);
    }
  
    /*
    录制结束，提交信息
    */
    function MOCKServerSubmit() {
      MOCKServerAjaxCommon(MOCKServerFetchedConfigs.requestRecordSubmitOriginal, {
        recordid: MOCKServerRecordid,
        path: MOCKServerRecordPath,
        desc: MOCKServerRecordDesc,
        date: Date.parse(new Date()).toString(),
        rtx: MOCKServerFetchedConfigs.configsRtx,
        project: JSON.stringify({
          path: MOCKServerFetchedConfigs.configsTarget
        })
      }, 'GET').then(function (res) {
        // 结束上一个录制，重开下一个录制
  
        // 返回非成功
        if (res && res.base_resp && res.base_resp.ret !== 0) {
          TemplateEngine(toast$1('custom', res.base_resp.ret_msg));
          setTimeout(function () {
            MOCKServerRemoveTags$1('MOCKServerToast');
          }, 2000);
        }
        if (res && res.base_resp && res.base_resp.ret === 0) {
          MOCKServerTag('readyToRecord');
          // 关闭填写信息弹窗
          MOCKServerRemoveTags$1('mockserverDialogMask');
          MOCKServerRemoveTags$1('mockserverDialog');
          TemplateEngine(toast$1('successSubmitToast'));
          setTimeout(function () {
            MOCKServerRemoveTags$1('MOCKServerToast');
          }, 2000);
        }
      }).catch(function (err) {
        console.log('MOCKServerAjaxCommon catche');
        console.log(err);
      });
    }
  
    /*
    取消本次录制，提交信息
    */
    function MOCKServerCancelRecord() {
      MOCKServerAjaxCommon(MOCKServerFetchedConfigs.requestRecordCancelOriginal, {
        recordid: MOCKServerRecordid,
        rtx: MOCKServerFetchedConfigs.configsRtx,
        project: JSON.stringify({
          path: MOCKServerFetchedConfigs.configsTarget
        })
      }, 'GET').then(function (res) {
        // 结束上一个录制，重开下一个录制
        MOCKServerTag('readyToRecord');
        // 关闭填写信息弹窗
        MOCKServerTag('mockserverDialogMask');
        MOCKServerTag('mockserverDialog');
        // 返回非成功
        if (res && res.base_resp && res.base_resp.ret !== 0) {
          TemplateEngine(toast$1('custom', res.base_resp.ret_msg));
          setTimeout(function () {
            MOCKServerRemoveTags$1('MOCKServerToast');
          }, 2000);
        }
        if (res && res.base_resp && res.base_resp.ret === 0) {
          TemplateEngine(toast$1('successCancel'));
          setTimeout(function () {
            MOCKServerRemoveTags$1('MOCKServerToast');
          }, 2000);
        }
      }).catch(function (err) {
        console.log('MOCKServerCancelRecord catch err');
        console.log(err);
      });
    }
  
    var MOCKServerRecordid = void 0;
    var MOCKServerRecordDesc = void 0;
    var MOCKServerRecordPath = void 0;
  
    // 准备录制，也就是去拿recordid
    function MOCKServerReadyToRecord() {
      // 获取recordid
      MOCKServerGetRecordid().then(function (res) {
        MOCKServerRecordid = res.recordid;
        MOCKServerTag('success', MOCKServerRecordid);
        // MOCKServerKidnapWebpage()
      }).catch(function (res) {
        console.log('err');
        console.log(res);
        // 返回非成功
        if (res && res.base_resp && res.base_resp.ret !== 0) {
          TemplateEngine(toast$1('custom', res.base_resp.ret_msg));
          setTimeout(function () {
            MOCKServerRemoveTags$1('MOCKServerToast');
          }, 2000);
        }
      });
    }
  
    // ping 看是否超时
    function MOCKServerRecordPing() {
      MOCKServerAjaxCommon(MOCKServerFetchedConfigs.requestRecordPing, {
        rtx: MOCKServerFetchedConfigs.configsRtx,
        project: JSON.stringify({
          path: MOCKServerFetchedConfigs.configsTarget
        })
      }, 'GET').then(function (res) {
        // 返回非成功
        if (res && res.base_resp && res.base_resp.ret === -210) {
          // 超时
          MOCKServerTag('readyToRecord');
        } else if (res && res.base_resp && res.base_resp.ret === 0) {
          // 非超时
          MOCKServerRecordid = res.result.recordid;
          MOCKServerTag('success', MOCKServerRecordid);
          // 开始劫持请求
          MOCKServerKidnapWebpage();
        } else {
          // 其它错误
          TemplateEngine(toast$1('custom', res.base_resp.ret_msg || JSON.stringify(res.base_resp)));
          setTimeout(function () {
            MOCKServerRemoveTags$1('MOCKServerToast');
          }, 2000);
        }
      }).catch(function (err) {
        console.log('MOCKServerCancelRecord catch err');
        console.log(err);
      });
    }
  
    function MOCKServerInit(configs) {
  
      // 不能等window onload，要立即执行 window.onload=function(){
      // MOCKServerRecordid = MOCKServerNewRecordid()
      MOCKServerConfigs = configs;
      var normalizedConfigs = new MOCKServerNormalizedConfigs();
      MOCKServerFetchedConfigs = normalizedConfigs.all;
      // 判断状态
      // 网页劫持
      if (MOCKServerFetchedConfigs.configsType === 'record') {
        // 只劫持录制
        if (MOCKServerFetchedConfigs.configsRtx) {
          if (MOCKServerFetchedConfigs.configsTarget) {
            // 初始化各种配置
            MOCKServerGetConfigs({
              configsOriginal: MOCKServerFetchedConfigs.configsOriginal,
              requestTargetOriginal: MOCKServerFetchedConfigs.requestTargetOriginal,
              requestPlayTargetOriginal: MOCKServerFetchedConfigs.requestPlayTargetOriginal,
              requestRecordTargetOriginal: MOCKServerFetchedConfigs.requestRecordTargetOriginal,
              requestRecordSubmitOriginal: MOCKServerFetchedConfigs.requestRecordSubmitOriginal,
              requestRedirectTargetOriginal: MOCKServerFetchedConfigs.requestRedirectTargetOriginal,
              actionType: MOCKServerFetchedConfigs.configsType,
              configsRtx: MOCKServerFetchedConfigs.configsRtx,
              configsFrom: MOCKServerFetchedConfigs.configsFrom,
              configsGetStraightOut: MOCKServerFetchedConfigs.configsGetStraightOut,
              configsTarget: MOCKServerFetchedConfigs.configsTarget,
              configsRecordidOriginal: MOCKServerFetchedConfigs.configsRecordidOriginal,
              originXMLHttpRequest: window.XMLHttpRequest
            });
            // 页面首次进来 ping下判断有无超时
            MOCKServerRecordPing();
            // if (MOCKServerGetCookie('mockServerMachineId') && MOCKServerGetCookie('mockServerTime')) { // 本地有recordid
            //   MOCKServerRecordid = `${MOCKServerGetCookie('mockServerMachineId')}__${MOCKServerGetCookie('mockServerTime')}`
            //   // 录制中，才开始转发请求
            //   MOCKServerTag('success', MOCKServerRecordid)
            //   MOCKServerKidnapWebpage();
            // } else { // 本地没有recordid，需要手动触发去拿
            //   MOCKServerTag('readyToRecord')
            // }
          } else {
            // target 未配置
            console.log('window onload show target 未配置 tag');
            MOCKServerTag('targeterror');
          }
        } else {
          // 无rtx报错
          console.log('window onload show 无rtx报错 tag');
          MOCKServerTag('rtxerror');
        }
      }
      // }
    }
  
    return MOCKServerInit;
  
  }());

exports.mockServerClient = mockServerClient;
  