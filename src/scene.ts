export type Keyframe<TValue> = {
    readonly time: number,
    readonly value: TValue
};

export type Keyframed<TValue> = Keyframe<TValue>[];

export type Color = readonly [number, number, number];

export type Vector = readonly [number, number, number];

export type Polygon = readonly Vector[];

export type LightKind = "point" | "ambient" | "directional";

export type AmbientLight = {
    readonly color: Color,
    readonly kind: "ambient";
};

export type DirectionalLight = {
    readonly direction: Vector,
    readonly color: Color
    readonly kind: "directional";
};

export type PointLight = {
    readonly point: Vector,
    readonly radius: number,
    readonly color: Color
    readonly kind: "point";
}

export type Light = DirectionalLight | PointLight | AmbientLight;

export type CameraProjectionKind = "orthographic" | "perspective";

export type OrthographicCameraProjection = {
    readonly scale: number,
    readonly kind: "orthographic"
};

export type PerspectiveCameraProjection = ({
    readonly horizontalFov: number
} | {
    readonly verticalFov: number
}) & {
    readonly kind: "perspective";
};

export type CameraProjection = OrthographicCameraProjection | PerspectiveCameraProjection;

export type CameraView = {
    readonly up: Vector,
    readonly forward: Vector,
    readonly eye: Vector
};

export type Camera = {
    readonly view: CameraView,
    readonly projection: CameraProjection
};

export type FitMode = "width" | "height" | "min" | "max";

export type Size = {
    readonly width: number,
    readonly height: number
};

export type Scene = {
    readonly fillColor: Keyframed<Color>,
    readonly strokeColor: Keyframed<Color>,
    readonly strokeWidth: Keyframed<number>,
    readonly camera: Keyframed<Camera>,
    readonly lights: readonly Keyframed<Light>[],
    readonly polygons: readonly Keyframed<Polygon>[],
    readonly name: string,
    readonly cullOccluded: boolean,
    readonly cullBackFaces: boolean,
    readonly anchorPoint: Keyframed<Vector>,
    readonly fit: FitMode,
    readonly size: Size,
    readonly extraRefreshes: number[]
};