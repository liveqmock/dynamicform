package actions;

import bl.beans.DocumentBean;
import bl.beans.EntryBean;
import bl.beans.UnitBean;
import bl.common.BusinessResult;
import bl.constants.BusTieConstant;
import bl.instancepool.SingleBusinessPoolManager;
import bl.mongobus.DocumentBusiness;
import bl.mongobus.EntryBusiness;
import bl.mongobus.UnitBusiness;
import org.apache.commons.lang.StringUtils;
import vo.table.TableHeaderVo;
import vo.table.TableInitVo;
import vo.table.TableQueryVo;

import java.util.List;

/**
 * Created by peter on 14-6-21.
 */
public class EntryAction extends BaseTableAction<EntryBusiness> {

    private EntryBean entry;
    private String documentId;
    private List<UnitBean> unitBeanList;
    private static final UnitBusiness ub = (UnitBusiness) SingleBusinessPoolManager.getBusObj(BusTieConstant.BUS_CPATH_UNIT_BUSINESS);
    private static final DocumentBusiness dbs = (DocumentBusiness) SingleBusinessPoolManager.getBusObj(BusTieConstant.BUS_CPATH_DOCUMENTBUSINESS);

    public List<UnitBean> getUnitBeanList() {
        return unitBeanList;
    }

    public void setUnitBeanList(List<UnitBean> unitBeanList) {
        this.unitBeanList = unitBeanList;
    }

    @Override
    public String getCustomJsp() {
        return "/pages/entry/entryPost.jsp";
    };

    @Override
    public String getActionPrex() {
        return getRequest().getContextPath() + "/entry";
    }

    @Override
    public TableInitVo getTableInit() {
        TableInitVo init = new TableInitVo();
        init.getAoColumns().add(new TableHeaderVo("sequence", "序号").disableSearch());
        init.getAoColumns().add(new TableHeaderVo("name", "实体名称").enableSearch());
        init.getAoColumns().add(new TableHeaderVo("code", "实体编码").enableSearch());
        init.getAoColumns().add(new TableHeaderVo("englishName", "实体英文名称").enableSearch());
        init.getAoColumns().add(new TableHeaderVo("subElementType", "元素归类").addSearchOptions(new String[][] { { "0", "1", "2", "3","4","5"}, { "主元素", "子元数", "伪参考值主元素", "伪检查值主元素", "伪单位主元素", "伪主元素"} }).enableSearch());
        init.getAoColumns().add(new TableHeaderVo("elementType", "实体类型").addSearchOptions(new String[][] { { "0", "1"}, { "定性", "定量"} }).enableSearch());
        init.getAoColumns().add(new TableHeaderVo("standardEntry", "标准分类").addSearchOptions(new String[][] { { "0", "1","2"}, { "CDISC", "机构标准","非标准"} }).enableSearch());

        return init;
    }

    @Override
    public String save() throws Exception {
        BusinessResult result = null;
        if (StringUtils.isEmpty(entry.getId())) {
            result = getBusiness().createLeaf(entry);
        } else {
            result = getBusiness().updateLeaf(entry, entry);
        }
        if (result != null && result.getErrors().size() > 0) {
            for (Object error : result.getErrors()) {
                addActionError(error.toString());
            }
            return INPUT;
        }
        if (result != null && result.getMessages().size() > 0) {
            for (Object message : result.getMessages()) {
                addActionMessage(message.toString());
            }
            return SUCCESS;
        }
        return SUCCESS;
    }

    public String edit() {
        entry = (EntryBean) getBusiness().getLeaf(getId()).getResponseData();
        unitBeanList = (List<UnitBean>) ub.getAllLeaves().getResponseData();
        UnitBean ubTemp = new UnitBean();
        ubTemp.setName("");
        ubTemp.setCode("");
        unitBeanList.add(0,ubTemp);
        return SUCCESS;
    }

    @Override
    public String delete() throws Exception {
        if (getIds() != null) {
            for (String id : getIds()) {
                getBusiness().deleteLeaf(id);
            }
        }
        return SUCCESS;
    }

    @Override
    public String add() {
        entry = new EntryBean();
        entry.setDocumentId(this.documentId);
        unitBeanList = (List<UnitBean>) ub.getAllLeaves().getResponseData();
        UnitBean ubTemp = new UnitBean();
        ubTemp.setName("");
        ubTemp.setCode("");
        unitBeanList.add(0,ubTemp);
        return SUCCESS;
    }
    @Override
    public String getTableTitle() {
        String prefixPath = getRequest().getContextPath()+"/";
        DocumentBean db = (DocumentBean) dbs.getLeaf(this.documentId).getResponseData();
        return "<ul class=\"breadcrumb\"><li>随访设计</li><li><a href=\""+prefixPath+"document/index.action\">系统模块[<i style='color:#58c9f3'>"+db.getName()+"</i>]</a></li><li class=\"active\"><a href=\""+prefixPath+"entry/index.action?documentId="+this.documentId+"\">实体</a></li></ul>";
    }
    @Override
    public TableQueryVo getModel() {
        TableQueryVo model = super.getModel();
        model.getFilter().put("documentId", this.documentId + "");
        model.getSort().put("sequence","asc");
        return model;
    }

    @Override
    public String getAddButtonParameter(){
        return "documentId="+this.documentId;
    }

    public EntryBean getEntry() {
        return entry;
    }

    public void setEntry(EntryBean entry) {
        this.entry = entry;
    }


    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }
}
