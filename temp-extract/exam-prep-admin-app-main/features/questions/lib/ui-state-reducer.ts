/**
 * UI State Reducer for Question Editor
 * Handles UI-only state like dialogs, bubble menus, and selected question
 * Does NOT handle form data - that's managed by React Hook Form
 */

export interface UIState {
  // Question selection
  selectedQuestion: number | null;

  // Dialogs
  showMetadata: boolean;
  showDeleteDialog: boolean;

  // Bubble menu states for question editor
  openNodeQuestion: boolean;
  openLinkQuestion: boolean;

  // Bubble menu states for explanation editor
  openNodeExplanation: boolean;
  openLinkExplanation: boolean;

  // Bubble menu states for options (dynamic, stored in Map)
  openNodeOptions: Map<string, boolean>;
  openLinkOptions: Map<string, boolean>;

  // Bubble menu states for sub-questions (for ESSAY_WITH_SUB)
  openNodeSub: Map<string, boolean>;
  openLinkSub: Map<string, boolean>;
}

export type UIAction =
  | { type: "SELECT_QUESTION"; payload: number | null }
  | { type: "TOGGLE_METADATA" }
  | { type: "TOGGLE_DELETE_DIALOG" }
  | { type: "SET_DELETE_DIALOG"; payload: boolean }
  | { type: "SET_OPEN_NODE_QUESTION"; payload: boolean }
  | { type: "SET_OPEN_LINK_QUESTION"; payload: boolean }
  | { type: "SET_OPEN_NODE_EXPLANATION"; payload: boolean }
  | { type: "SET_OPEN_LINK_EXPLANATION"; payload: boolean }
  | { type: "SET_OPEN_NODE_OPTION"; payload: { label: string; value: boolean } }
  | { type: "SET_OPEN_LINK_OPTION"; payload: { label: string; value: boolean } }
  | { type: "SET_OPEN_NODE_SUB"; payload: { subId: string; value: boolean } }
  | { type: "SET_OPEN_LINK_SUB"; payload: { subId: string; value: boolean } }
  | { type: "RESET_UI" };

export const initialUIState: UIState = {
  selectedQuestion: null,
  showMetadata: false,
  showDeleteDialog: false,
  openNodeQuestion: false,
  openLinkQuestion: false,
  openNodeExplanation: false,
  openLinkExplanation: false,
  openNodeOptions: new Map(),
  openLinkOptions: new Map(),
  openNodeSub: new Map(),
  openLinkSub: new Map(),
};

export function uiStateReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SELECT_QUESTION":
      return {
        ...state,
        selectedQuestion: action.payload,
      };

    case "TOGGLE_METADATA":
      return {
        ...state,
        showMetadata: !state.showMetadata,
      };

    case "TOGGLE_DELETE_DIALOG":
      return {
        ...state,
        showDeleteDialog: !state.showDeleteDialog,
      };

    case "SET_DELETE_DIALOG":
      return {
        ...state,
        showDeleteDialog: action.payload,
      };

    case "SET_OPEN_NODE_QUESTION":
      return {
        ...state,
        openNodeQuestion: action.payload,
      };

    case "SET_OPEN_LINK_QUESTION":
      return {
        ...state,
        openLinkQuestion: action.payload,
      };

    case "SET_OPEN_NODE_EXPLANATION":
      return {
        ...state,
        openNodeExplanation: action.payload,
      };

    case "SET_OPEN_LINK_EXPLANATION":
      return {
        ...state,
        openLinkExplanation: action.payload,
      };

    case "SET_OPEN_NODE_OPTION":
      return {
        ...state,
        openNodeOptions: new Map(state.openNodeOptions).set(
          action.payload.label,
          action.payload.value
        ),
      };

    case "SET_OPEN_LINK_OPTION":
      return {
        ...state,
        openLinkOptions: new Map(state.openLinkOptions).set(
          action.payload.label,
          action.payload.value
        ),
      };

    case "SET_OPEN_NODE_SUB":
      return {
        ...state,
        openNodeSub: new Map(state.openNodeSub).set(
          action.payload.subId,
          action.payload.value
        ),
      };

    case "SET_OPEN_LINK_SUB":
      return {
        ...state,
        openLinkSub: new Map(state.openLinkSub).set(
          action.payload.subId,
          action.payload.value
        ),
      };

    case "RESET_UI":
      return initialUIState;

    default:
      return state;
  }
}

// Helper functions for accessing Map-based state
export const getOpenNodeOption = (state: UIState, label: string): boolean =>
  state.openNodeOptions.get(label) || false;

export const getOpenLinkOption = (state: UIState, label: string): boolean =>
  state.openLinkOptions.get(label) || false;

export const getOpenNodeSub = (state: UIState, subId: string): boolean =>
  state.openNodeSub.get(subId) || false;

export const getOpenLinkSub = (state: UIState, subId: string): boolean =>
  state.openLinkSub.get(subId) || false;
