import {Case} from '../../../../resources/interface/case';
import {LoadingEmitter} from '../../../../utility/loading-emitter';
import {TreePetriflowIdentifiers} from '../../model/tree-petriflow-identifiers';
import {ImmediateData} from '../../../../resources/interface/immediate-data';

export class CaseTreeNode {
    public case: Case;
    public children: Array<CaseTreeNode>;
    public dirtyChildren: boolean;
    public loadingChildren: LoadingEmitter;
    public removingNode: LoadingEmitter;
    public addingNode: LoadingEmitter;
    public parent: CaseTreeNode;

    constructor(nodeCase: Case, parentNode: CaseTreeNode) {
        this.case = nodeCase;
        this.children = [];
        this.dirtyChildren = true;
        this.loadingChildren = new LoadingEmitter();
        this.removingNode = new LoadingEmitter();
        this.addingNode = new LoadingEmitter();
        this.parent = parentNode;
    }

    /**
     * @returns whether this node has the value `true` in it's [immediate data field]{@link TreePetriflowIdentifiers#CAN_ADD_CHILDREN}
     * that controls this behavior.
     */
    public canAddChildren(): boolean {
        const immediate = this.searchImmediateData(TreePetriflowIdentifiers.CAN_ADD_CHILDREN);
        return !!immediate && immediate.value;
    }

    /**
     * @returns whether this node has the value `true` in it's [immediate data field]{@link TreePetriflowIdentifiers#CAN_REMOVE_NODE}
     * that controls this behavior.
     */
    public canBeRemoved(): boolean {
        const immediate = this.searchImmediateData(TreePetriflowIdentifiers.CAN_REMOVE_NODE);
        return this.parent && !!immediate && immediate.value;
    }

    /**
     * @returns whether this node's children are currently being loaded
     */
    public isLoadingChildren(): boolean {
        return this.loadingChildren.isActive;
    }

    /**
     * @returns whether this node is being removed from the tree
     */
    public isBeingRemoved(): boolean {
        return this.removingNode.isActive;
    }

    /**
     * @returns whether children are being added to this node
     */
    public isAddingNode(): boolean {
        return this.addingNode.isActive;
    }

    private searchImmediateData(dataId: string): ImmediateData | undefined {
        return this.case.immediateData.find(data => data.stringId === dataId);
    }
}