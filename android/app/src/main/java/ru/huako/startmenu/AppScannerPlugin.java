package ru.huako.startmenu;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "AppScanner")
public class AppScannerPlugin extends Plugin {

    /**
     * Input:  { packages: string[] }  (optional)
     * Output: { installed: string[] } — subset of the given packages that are installed.
     *         If no list is given, returns every installed package on the device.
     */
    @PluginMethod
    public void getInstalled(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        JSArray result = new JSArray();

        JSArray requested = call.getArray("packages", null);
        if (requested != null) {
            for (int i = 0; i < requested.length(); i++) {
                String pkg = requested.optString(i, null);
                if (pkg == null || pkg.isEmpty()) continue;
                if (isInstalled(pm, pkg)) result.put(pkg);
            }
        } else {
            List<android.content.pm.ApplicationInfo> apps =
                    pm.getInstalledApplications(0);
            for (android.content.pm.ApplicationInfo app : apps) {
                result.put(app.packageName);
            }
        }

        JSObject ret = new JSObject();
        ret.put("installed", result);
        call.resolve(ret);
    }

    /**
     * Input:  { uri: "scheme://host/path" }  or  { scheme, host?, path? }
     * Output: { resolves: boolean, packages: string[] } — apps with a BROWSABLE
     *         activity that handles this URI (i.e. the deep link will work).
     */
    @PluginMethod
    public void resolveScheme(PluginCall call) {
        Uri uri = buildUri(call);
        if (uri == null) {
            call.reject("Provide 'uri' or 'scheme'");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);

        PackageManager pm = getContext().getPackageManager();
        List<ResolveInfo> matches = pm.queryIntentActivities(intent, 0);

        JSArray packages = new JSArray();
        for (ResolveInfo ri : matches) {
            if (ri.activityInfo != null) packages.put(ri.activityInfo.packageName);
        }

        JSObject ret = new JSObject();
        ret.put("resolves", !matches.isEmpty());
        ret.put("packages", packages);
        call.resolve(ret);
    }

    /**
     * Input: { uri: "scheme://host/path" } or { scheme, host?, path? }
     * Launches the deep link as a BROWSABLE VIEW intent.
     */
    @PluginMethod
    public void openUri(PluginCall call) {
        Uri uri = buildUri(call);
        if (uri == null) {
            call.reject("Provide 'uri' or 'scheme'");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("No app handles this URI", e);
        }
    }

    /**
     * Input: { package: "com.example.app" }
     * Launches the app's default launcher activity.
     */
    @PluginMethod
    public void launchPackage(PluginCall call) {
        String pkg = call.getString("package");
        if (pkg == null || pkg.isEmpty()) {
            call.reject("Provide 'package'");
            return;
        }
        PackageManager pm = getContext().getPackageManager();
        Intent intent = pm.getLaunchIntentForPackage(pkg);
        if (intent == null) {
            call.reject("App not installed or has no launcher activity");
            return;
        }
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to launch app", e);
        }
    }

    private boolean isInstalled(PackageManager pm, String pkg) {
        try {
            pm.getPackageInfo(pkg, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private Uri buildUri(PluginCall call) {
        String uriStr = call.getString("uri");
        if (uriStr != null && !uriStr.isEmpty()) {
            return Uri.parse(uriStr);
        }
        String scheme = call.getString("scheme");
        if (scheme == null || scheme.isEmpty()) return null;
        String host = call.getString("host", "");
        String path = call.getString("path", "");
        StringBuilder sb = new StringBuilder(scheme).append("://");
        if (host != null) sb.append(host);
        if (path != null && !path.isEmpty()) {
            if (!path.startsWith("/")) sb.append("/");
            sb.append(path);
        }
        return Uri.parse(sb.toString());
    }
}
